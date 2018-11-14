class DeferredPromise {
    resolve;
    reject;
    promise;
  
    constructor() {
      this.promise = new Promise((resolve, reject)=> {
        this.reject = reject
        this.resolve = resolve
      })
    }
}
export const fakeReporter = () => {
  const deferred = new DeferredPromise()

  const reporter = {
    jasmineDone: (_, done) => {
      deferred.resolve()
    }
  }

  return {
    promise: deferred.promise,
    reporter
  }
}
