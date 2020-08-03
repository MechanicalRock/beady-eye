export const fakeReporter = (callback) => {
  return {
    jasmineDone: (_, done) => {
      callback();
    },
  };
};
