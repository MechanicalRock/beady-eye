import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import { S3JUnitReporter } from './S3JunitReporter';
import { JUnitXmlReporter } from 'jasmine-reporters';
const Jasmine = require('jasmine')
const TSConsoleReporter = require('jasmine-ts-console-reporter');

export const lambdaNotificationReporter = (callback: Callback) => {
  return {
    results : [],
    testErrors: [],
    passedExpectations : [],
    jasmineDone: function (result) {
      if (result.overallStatus === 'failed') {
        let failedTests = this.testErrors.map(x => x.fullName).join(', ');
        console.log(this.testErrors);
        callback(new Error("tests failed:" + failedTests));
      } else{
        let passedTestCount = this.results.filter(x => x.status === 'passed').length
        let testSummary = `Tests Passed: ${passedTestCount}`
        this.passedExpectations.forEach((exp) => {
          testSummary += exp.description; 
        })
        callback(null,testSummary);
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
    
    constructor(callback: Callback, productname?:string, s3BucketName?:string, localExecution?:boolean ) {
        this.jasmine = new Jasmine()
        // Write to tmp directory of lambda
        let reportLocation = '/tmp/';
        if(localExecution) reportLocation = "./";
        this.withConfigurer(defaultJasmineConfigurer)
        let junitReporter = new JUnitXmlReporter({
          savePath: reportLocation,
          copnsolidateAll: true
        });
        this.jasmine.env.addReporter(junitReporter);
        if(s3BucketName){
          this.jasmine.env.addReporter(S3JUnitReporter(callback, s3BucketName, reportLocation+"junitresults.xml"));
        }
        this.jasmine.env.addReporter(lambdaNotificationReporter(callback));
    }

    /**
     * Takes a callback function (jasmine) => {}, providing access to the underlying jasmine object for configuration
     * @param jasmineConfigurer 
     */
    withConfigurer( jasmineConfigurer ){
        jasmineConfigurer(this.jasmine)
    }

    execute() {
        this.jasmine.env.execute()
    }
}
