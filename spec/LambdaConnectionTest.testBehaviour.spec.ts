let connectionTester = require('../lambda/connection-tester')
var sinon = require('sinon')
var net = require('net')

describe("The Connection-Tester lambda",() => {
    let context = undefined

    let event = {
            endpointAddress : 'thelocalhost',
            endpointPort : 1234,
            connectionTimeout_ms : 10
    }

    let callbackSuccessWithExpectedResult = (result, done) => {
        return (err,data) => {
            expect(err).toBe(null)
            expect(data).toBeDefined()
            expect(data.result).toBe(result)
            done()
        }
    }

    let callbackFailedWithExpectedMessage = (msgList, done) => {
        return (err,data) => {
            expect(err).toBeDefined()
            expect(data).toBe(undefined)
            expect(err.message).toBeDefined()
            msgList.map(x => expect(err.message).toEqual(expect.stringContaining(x)));
            done();
        }
    }

    let withMockedConnectionResult = (result: string | undefined =undefined) => {
        let fakeConnection = () => {
            let s = net.Socket();
            // Fire the intended result, or allow natural timeout if undefined
            if (result !== undefined) { setTimeout(() => s.emit(result), 2 ); }
            return s;
        }
        let fakeSocket = sinon.stub(net, 'createConnection').callsFake(fakeConnection)     
    }

    afterEach(() => {
        if (net.createConnection.restore) {
            net.createConnection.restore()
        }
    })

    it("should respond true when a successful connection is made", (done) => {
        withMockedConnectionResult('connect')
        let callback = callbackSuccessWithExpectedResult(true, done);
        connectionTester.connect(event,context,callback)
    })
    
    it("should respond false when a connection error occurs", (done) => {
        withMockedConnectionResult('error')
        let callback = callbackFailedWithExpectedMessage(['failed'], done)
        connectionTester.connect(event,context,callback)
    })

    it("should respond false when a connection times out", (done) => {
        withMockedConnectionResult()
        let callback = callbackSuccessWithExpectedResult(false, done);
        connectionTester.connect(event,context,callback)  
    })
    
    it("should respond with handled error when the endpoint parameter is missing", (done) => {
        let callback = callbackFailedWithExpectedMessage(['Invalid', 'missing'], done)
        connectionTester.connect({endpointPort: 1234},context,callback)  

    })

    it("should respond with handled error when the port parameter is missing", (done) => {
        let callback = callbackFailedWithExpectedMessage(['Invalid', 'missing'], done)
        connectionTester.connect({endpointAddress: "Address"},context,callback)  

    })

    it("should respond with handled error when the port parameter is invalid", (done) => {
        let callback = callbackFailedWithExpectedMessage(['Invalid', 'should be an integer'], done)
        connectionTester.connect({endpointAddress: "Address", endpointPort: "bad"},context,callback)  

    })

})