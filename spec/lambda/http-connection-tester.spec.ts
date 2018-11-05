import { uriEndpointAddress } from "../../src/interfaces";

describe("Given http connection tester", () => {
    // tslint:disable-next-line:max-line-length
    describe("When I send a HTTP request with failOnHTTP enabled ", () => {
        describe("and the website is not configured to redirect the user to HTTPS", () => {
            const events:uriEndpointAddress = {
                failOnHTTP: true,
                Uri: "http://foo.example.com",
            };
            let connectionTester;
            beforeEach(() => {
                jest.mock("request-promise-native", () => {
                    return () => Promise.resolve({
                        header: {
                            location: "http://foo.example.com",
                        },
                        statusCode: 200,
                    });
                });
                connectionTester = require("../../lambda/http-connection-tester")
            });

            afterEach(() => {
                jest.resetModuleRegistry();
            });

            it("Then http-connection-tester should throw an error", (done) => {
                connectionTester.connect(events, undefined, (error) => {
                    expect(error).toBeDefined();
                    done();
                });
            });
        });
        describe("and the website is configured to redirect the user to HTTPS", () => {
            const events: uriEndpointAddress = {
                failOnHTTP: true,
                Uri: "http://foo.example.com",
            };
            let connectionTester;

            beforeEach(() => {
                jest.mock("request-promise-native", () => {
                    return () => Promise.resolve({
                        header: {
                            location: "https://foo.example.com",
                        },
                        statusCode: 301
                    });
                });
                connectionTester = require("../../lambda/http-connection-tester")
            });

            afterEach(() => {
                jest.resetModuleRegistry();
            });

            it("Then http-connection-tester should not throw an error", (done) => {
                connectionTester.connect(events, undefined, (error) => {
                    expect(error).toBeNull();
                    done();
                });
            });
        });
    });

    describe("When I send a HTTP request and the website does not exist ", () => {
        const events: uriEndpointAddress = {
            failOnHTTP: true,
            Uri: "http://foo.example.com",
        };
        let connectionTester;
        
        beforeEach(() => {
            jest.mock("request-promise-native", () => {
                return () => Promise.reject({
                    statusCode: 500,
                });
            });
            connectionTester = require("../../lambda/http-connection-tester")
        });

        afterEach(() => {
            jest.resetModuleRegistry();
        });

        it("Then http-connection-tester should throw an error", (done) => {
            connectionTester.connect(events, undefined, (error) => {
                expect(error).toBeDefined();
                done();
            });
        });
    });
});