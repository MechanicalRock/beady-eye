import * as Jasmine from "jasmine";
import * as TSConsoleReporter from "jasmine-ts-console-reporter";
import { fakeReporter } from "./fakeReporter";

export interface TestRunner {
  execute(suite: Jasmine.suite): Promise<void>;
}

const defaultJasmineConfigurer = (jasmine) => {
  const env = jasmine.env;
  env.clearReporters(); // Clear default console reporter
  // Spec filter on env is deprecated
  // env.specFilter = () => true
  const reporter = new TSConsoleReporter();
  reporter.setOptions({ showColor: false });
  env.addReporter(reporter);
};

export class JasmineComplianceRunner {
  public jasmine;
  private reportingCompleted: Promise<void>;

  constructor(...reporters: Array<any>) {
    this.jasmine = new Jasmine();
    this.withConfigurer(defaultJasmineConfigurer);
    reporters.forEach((r) => this.jasmine.env.addReporter(r));

    this.reportingCompleted = new Promise((resolve, _) => {
      this.jasmine.env.addReporter(fakeReporter(resolve));
    });
  }

  /**
   * Takes a callback function (jasmine) => {}, providing access to the underlying jasmine object for configuration
   * @param jasmineConfigurer
   */
  public withConfigurer(jasmineConfigurer) {
    jasmineConfigurer(this.jasmine);
  }
  public async execute(): Promise<void> {
    this.jasmine.env.execute();
    return this.reportingCompleted;
  }
}
