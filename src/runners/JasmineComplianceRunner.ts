import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import { JUnitXmlReporter } from 'jasmine-reporters';
import { fakeReporter } from './fakeReporter';
const Jasmine = require('jasmine')
const TSConsoleReporter = require('jasmine-ts-console-reporter');
import * as fs from 'fs';
import { format } from 'date-fns';
import { S3 } from 'aws-sdk'

export const lambdaNotificationReporter = () => {
  return {
    results : [],
    testErrors: [],
    passedExpectations : [],
    jasmineDone: function (result) {
      if (result.overallStatus === 'failed') {
        let failedTests = this.testErrors.map(x => x.fullName).join(', ');
        console.log(this.testErrors);
      } else{
        let passedTestCount = this.results.filter(x => x.status === 'passed').length
        let testSummary = `Tests Passed: ${passedTestCount}`
        this.passedExpectations.forEach((exp) => {
          testSummary += exp.description; 
        })
      }
    },
    specDone : function(result) {
      this.results.push( result )
      if (result.status !== 'passed') {
        this.testErrors.push(result);
        console.log(result.failedExpectations);
      } 
    },
    suiteDone : function(result) {
    //   console.log("SUITE DONE")
    }
  }
}

const defaultJasmineConfigurer = (jasmine) => {
    let env = jasmine.env
  
    // env.fail
    env.clearReporters(); // Clear default console reporter
    // Spec filter on env is deprecated
    // env.specFilter = () => true
    let reporter = new TSConsoleReporter()
    reporter.setOptions( {showColor : false})
    env.addReporter(reporter);
    //  env.throwOnExpectationFailure(true)
}



export class JasmineComplianceRunner {
    jasmine
    private reportingCompleted: Promise<void>;
    private basePath;
    private reportLocation;
    
    constructor(localExecution?:boolean ) {
        this.jasmine = new Jasmine()
        // Write to tmp directory of lambda
        this.basePath=localExecution?'./':'/tmp/';
        this.reportLocation = this.basePath+'junitresults.xml';
        this.withConfigurer(defaultJasmineConfigurer)
        let junitReporter = new JUnitXmlReporter({
          savePath: this.basePath,
          copnsolidateAll: true
        });
        this.jasmine.env.addReporter(junitReporter);
        this.jasmine.env.addReporter(lambdaNotificationReporter());
        const fakeRpt = fakeReporter()
        this.jasmine.env.addReporter(fakeRpt.reporter);
        this.reportingCompleted = fakeRpt.promise;
    }

    // constructor(...reporters: any[]) {
    //   reporters.forEach(r => this.jasmine.env.addReporter(r));
    //   const fakeRpt = fakeReporter()
    //   this.jasmine.env.addReporter(fakeRpt.reporter);
    //   this.reportingCompleted = fakeRpt.promise;
    // }

    /**
     * Takes a callback function (jasmine) => {}, providing access to the underlying jasmine object for configuration
     * @param jasmineConfigurer 
     */
    withConfigurer( jasmineConfigurer ){
        jasmineConfigurer(this.jasmine)
    }

    async execute(): Promise<void> {
        this.jasmine.env.execute();
        return this.reportingCompleted;
    }

    async uploadJUnitReportToS3(s3ObjectPrefix:string, s3BucketName:string) {
      
        const reportContents = fs.readFileSync(this.reportLocation, 'utf8');
        const now = format(new Date(), 'YYYY-MM-DD-HH-mm-ss');
        const fileName = `${s3ObjectPrefix}-${now}.xml`;
        
        const params = {
          Body: reportContents,
          Bucket: s3BucketName,
          Key: fileName
        };
        let s3 = new S3();
        return(s3.putObject(params).promise());
        
    }
}
