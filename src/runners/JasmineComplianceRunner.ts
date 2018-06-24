import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';

const Jasmine = require('jasmine')
const TSConsoleReporter = require('jasmine-ts-console-reporter');

export const lambdaNotificationReporter = (callback: Callback) => {
  return {
    results : [],
    testErrors: [],
    passedExpectations : [],
    jasmineDone: function (result) {
      if (result.overallStatus === 'failed') {
        let failedTests = this.testErrors.map(x => x.fullName).join(',');
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
    env.specFilter = () => true
    let reporter = new TSConsoleReporter()
    reporter.setOptions( {showColor : false})
    env.addReporter(reporter);
    //  env.throwOnExpectationFailure(true)
  
}

export class JasmineComplianceRunner {
    jasmine
    
    constructor(callback: Callback) {
        this.jasmine = new Jasmine()
        
        this.withConfigurer(defaultJasmineConfigurer)
        
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
