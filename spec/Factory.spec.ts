import * as AWS from "aws-sdk";
import { Factory, ServiceFactory } from "../src/Factory";
import AWSMock = require("aws-sdk-mock");

AWSMock.setSDKInstance(AWS);

describe("Service Factory", () => {
    describe("When I construct a factory", () => {
        let factory: Factory;
        let serviceFactory: ServiceFactory<AWS.S3, AWS.S3.ClientConfiguration>;

        beforeEach(() => {
            factory = new Factory({
                accessKeyId: "origin",
                secretAccessKey: "originKey",
                sessionToken: "originToken",
            });
            expect(factory).toBeDefined();
        });

        it("should return an object with a ForService method", () => {
            expect(factory).toHaveProperty("ForService");
        });

        describe("and construct a service factory", () => {
            beforeEach(() => {
                serviceFactory = factory.ForService(AWS.S3);
                expect(serviceFactory).toBeDefined();
            });

            it("should return an object with a WithOptions method", () => {
                expect(serviceFactory).toHaveProperty("WithOptions");
            });

            it("should return an object with a WithRoleChain method", () => {
                expect(serviceFactory).toHaveProperty("WithRoleChain");
            });

            describe("and call WithOptions", () => {
                let serviceFactoryWithOptions: any;
                beforeEach(() => {
                    serviceFactoryWithOptions = serviceFactory.WithOptions({
                        region: "",
                    });
                });

                it("should return an object", () => {
                    expect(serviceFactoryWithOptions).toBeDefined();
                });

                describe("calling WithOptions again", () => {
                    it("should return an error", () => {
                        expect(() => {
                            (serviceFactoryWithOptions as any).WithOptions({
                                region: "",
                            });
                        },
                        ).toThrow();
                    });
                });
            });

            describe("and calling WithRoleChain", () => {
                let service: AWS.S3;
                let mockFn = jest.fn();

                beforeEach(async (done) => {
                    mockFn.mockClear();
                    mockFn = jest.fn((request: AWS.STS.AssumeRoleRequest, callback) => {
                        callback(null, {
                            Credentials: {
                                AccessKeyId: `${request.RoleArn}-1`,
                                SecretAccessKey: `${request.RoleArn}-1`,
                                SessionToken: `${request.RoleSessionName}-1`,
                            },
                        } as AWS.STS.AssumeRoleResponse);
                    });

                    AWSMock.mock("STS", "assumeRole", mockFn);

                    service = await serviceFactory.WithRoleChain({
                        RoleArn: "MyRoleArn1",
                        RoleSessionName: "MyRoleSessionName1",
                    }, {
                        RoleArn: "MyRoleArn2",
                        RoleSessionName: "MyRoleSessionName2",
                    });
                    done();
                });

                it("should call each role in the chain when there are multiple roles", () => {
                    expect(mockFn).toHaveBeenCalledTimes(2);
                });

                it("should store the correct credentials in the service", () => {
                    expect(service.config.accessKeyId).toBe("MyRoleArn2-1");
                    expect(service.config.secretAccessKey).toBe("MyRoleArn2-1");
                    expect(service.config.sessionToken).toBe("MyRoleSessionName2-1");
                });
            });
        });
    });
});
