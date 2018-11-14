import { fakeReporter } from './fakeReporter';
import * as Jasmine from 'jasmine';
import * as TSConsoleReporter from 'jasmine-ts-console-reporter';


export interface TestRunner {
  execute(suite: Jasmine.suite): Promise<void>
}

const defaultJasmineConfigurer = (jasmine) => {
  let env = jasmine.env
  env.clearReporters(); // Clear default console reporter
  // Spec filter on env is deprecated
  // env.specFilter = () => true
  let reporter = new TSConsoleReporter()
  reporter.setOptions({ showColor: false })
  env.addReporter(reporter);
}

export class JasmineComplianceRunner {
  jasmine
  private reportingCompleted: Promise<void>;
 
  constructor(...reporters: any[]) {
    this.jasmine = new Jasmine()
    this.withConfigurer(defaultJasmineConfigurer)
    reporters.forEach(r => this.jasmine.env.addReporter(r));
    const fakeRpt = fakeReporter()
    this.jasmine.env.addReporter(fakeRpt.reporter);
    this.reportingCompleted = fakeRpt.promise;
  }

  /**
   * Takes a callback function (jasmine) => {}, providing access to the underlying jasmine object for configuration
   * @param jasmineConfigurer 
   */
  withConfigurer(jasmineConfigurer) {
    jasmineConfigurer(this.jasmine)
  }
  async execute(): Promise<void> {
    this.jasmine.env.execute();
    return this.reportingCompleted;
  }
}

