import { S3,  } from 'aws-sdk'
import { Factory, ServiceFactory } from '../src/Factory'

describe('Service Factory', () => {
    describe('When I construct a factory', () => {
        let factory: Factory
        let serviceFactory: ServiceFactory<S3, S3.ClientConfiguration>

        beforeEach(() => {
            factory = new Factory({})
            expect(factory).toBeDefined()
        })

        it('should return an object with a ForService method', () => {
            expect(factory).toHaveProperty('ForService')
        })

        describe('and construct a service factory', () => {
            beforeEach(() => {
                serviceFactory = factory.ForService(S3)
                expect(serviceFactory).toBeDefined()
            })

            it('should return an object with a WithOptions method', () => {
                expect(serviceFactory).toHaveProperty('WithOptions')
            })

            it('should return an object with a WithRoleChain method', () => {
                expect(serviceFactory).toHaveProperty('WithRoleChain')
            })

            describe('and call WithOptions', () => {
                let serviceFactoryWithOptions: any
                beforeEach(() => {
                    serviceFactoryWithOptions = serviceFactory.WithOptions({
                        region: ""
                    })
                })

                it('should return an object', () => {
                    expect(serviceFactoryWithOptions).toBeDefined()
                })

                describe('calling WithOptions again', () => {
                    it('should return an error', () => {
                        expect(() => {
                            (serviceFactoryWithOptions as any).WithOptions({
                                region: ""
                            })}
                        ).toThrow()
                    })
                })
            })

            describe('and calling WithRoleChain', () => {
                let service: S3
                beforeEach(async (done) => {
                    service = await serviceFactory.WithRoleChain({
                        RoleArn: "MyArn",
                        RoleSessionName: "MyRoleSessionName"
                    })
                    done()
                })
            })
        })
    })
})