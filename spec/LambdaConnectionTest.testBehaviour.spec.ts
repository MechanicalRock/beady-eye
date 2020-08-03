const connectionTester = require("../lambda/connection-tester");
const sinon = require("sinon");
const net = require("net");

describe("The Connection-Tester lambda", () => {
  const context = undefined;

  const event = {
    endpointAddress: "thelocalhost",
    endpointPort: 1234,
    connectionTimeout_ms: 10,
  };

  const callbackSuccessWithExpectedResult = (result, done) => {
    return (err, data) => {
      expect(err).toBe(null);
      expect(data).toBeDefined();
      expect(data.result).toBe(result);
      done();
    };
  };

  const callbackFailedWithExpectedMessage = (msgList, done) => {
    return (err, data) => {
      expect(err).toBeDefined();
      expect(data).toBe(undefined);
      expect(err.message).toBeDefined();
      msgList.map((x) =>
        expect(err.message).toEqual(expect.stringContaining(x))
      );
      done();
    };
  };

  const withMockedConnectionResult = (
    result: string | undefined = undefined
  ) => {
    const fakeConnection = () => {
      const s = net.Socket();
      // Fire the intended result, or allow natural timeout if undefined
      if (result !== undefined) {
        setTimeout(() => s.emit(result), 2);
      }
      return s;
    };
    const fakeSocket = sinon
      .stub(net, "createConnection")
      .callsFake(fakeConnection);
  };

  afterEach(() => {
    if (net.createConnection.restore) {
      net.createConnection.restore();
    }
  });

  it("should respond true when a successful connection is made", (done) => {
    withMockedConnectionResult("connect");
    const callback = callbackSuccessWithExpectedResult(true, done);
    connectionTester.connect(event, context, callback);
  });

  it("should respond false when a connection error occurs", (done) => {
    withMockedConnectionResult("error");
    const callback = callbackFailedWithExpectedMessage(["failed"], done);
    connectionTester.connect(event, context, callback);
  });

  it("should respond false when a connection times out", (done) => {
    withMockedConnectionResult();
    const callback = callbackSuccessWithExpectedResult(false, done);
    connectionTester.connect(event, context, callback);
  });

  it("should respond with handled error when the endpoint parameter is missing", (done) => {
    const callback = callbackFailedWithExpectedMessage(
      ["Invalid", "missing"],
      done
    );
    connectionTester.connect({ endpointPort: 1234 }, context, callback);
  });

  it("should respond with handled error when the port parameter is missing", (done) => {
    const callback = callbackFailedWithExpectedMessage(
      ["Invalid", "missing"],
      done
    );
    connectionTester.connect({ endpointAddress: "Address" }, context, callback);
  });

  it("should respond with handled error when the port parameter is invalid", (done) => {
    const callback = callbackFailedWithExpectedMessage(
      ["Invalid", "should be an integer"],
      done
    );
    connectionTester.connect(
      { endpointAddress: "Address", endpointPort: "bad" },
      context,
      callback
    );
  });
});
