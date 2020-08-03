export const lambdaNotificationReporter = () => {
  return {
    results: [],
    testErrors: [],
    passedExpectations: [],
    jasmineDone: function (result) {
      if (result.overallStatus === "failed") {
        const failedTests = this.testErrors.map((x) => x.fullName).join(", ");
        console.log(this.testErrors);
      } else {
        const passedTestCount = this.results.filter(
          (x) => x.status === "passed"
        ).length;
        let testSummary = `Tests Passed: ${passedTestCount}`;
        this.passedExpectations.forEach((exp) => {
          testSummary += exp.description;
        });
      }
    },
    specDone: function (result) {
      this.results.push(result);
      if (result.status !== "passed") {
        this.testErrors.push(result);
        console.log(result.failedExpectations);
      }
    },
    suiteDone: function (result) {
      //   console.log("SUITE DONE")
    },
  };
};
