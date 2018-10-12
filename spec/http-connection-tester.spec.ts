
describe("Given http connection tester", () => {
    // tslint:disable-next-line:max-line-length
    describe ("When I send a HTTP request with failOnHTTP enabled ", () => {
        describe("and the website is not configured to redirect the user to HTTPS", () => {
            const events  = {
                failOnHTTP : true,
                Uri : "http://foo.example.com",
            };
            beforeEach( () =>  {
                jest.mock("request-promise-native", () => {
                    return () => Promise.resolve( {
                        header: {
                            location: "http://foo.example.com",
                        },
                        statusCode: 200,
                    });
                } );
            });

            afterEach(() => {
                jest.resetModuleRegistry();
            });

            it("Then http-connection-tester should throw an error", (done) => {
                require("../lambda/http-connection-tester").connect(events, undefined , (error) => {
                    expect(error).toBeDefined();
                    done();
                } );
            } );
        });
        describe("and the website is configured to redirect the user to HTTPS", () => {
            const events  = {
                failOnHTTP : true,
                Uri : "http://foo.example.com",
            };
            beforeEach( () =>  {
                jest.mock("request-promise-native", () => {
                    return () => Promise.resolve( {
                        header: {
                            location: "https://foo.example.com",
                        },
                        statusCode: 301
                    });
                });
            });

            afterEach(() => {
                jest.resetModuleRegistry();
            });

            it("Then http-connection-tester should not throw an error", (done) => {
                require("../lambda/http-connection-tester").connect(events, undefined , (error) => {
                    expect(error).toBeNull();
                    done();
                } );
            } );
        });
    });

    describe ("When I send a HTTP request and the website does not exist ", () => {
        const events  = {
            failOnHTTP : true,
            Uri : "http://foo.example.com",
        };
        beforeEach( () =>  {
            jest.mock("request-promise-native", () => {
                return () => Promise.reject( {
                    statusCode: 500,
                });
            } );
        });

        afterEach(() => {
            jest.resetModuleRegistry();
        });

        it("Then http-connection-tester should throw an error", (done) => {
            require("../lambda/http-connection-tester").connect(events, undefined , (error) => {
                expect(error).toBeDefined();
                done();
            } );
        } );
});
