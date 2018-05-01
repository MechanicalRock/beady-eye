import { S3 } from "../src/S3"
import { awsMockCallback, awsMockFailureCallback } from './support'
import AWSMock = require('aws-sdk-mock')

describe('S3.bucket#isPubliclyAccessible', () => {
    let bucketName = "myS3Bucket"

    afterEach(() => {
        AWSMock.restore('S3');
    })

    describe('when ACL grants public access', () => {

        let examples = ['AllUsers', 'AuthenticatedUsers'].forEach((example) => {

            it(`should return true if the ACL includes global group ${example}`, async (done) => {
                let exampleFile = `test-data/getBucketAcl-publicRead${example}.json`

                AWSMock.mock('S3', 'getBucketAcl', awsMockCallback(exampleFile));

                let response = await S3.bucket(bucketName).isPubliclyAccessible()
                expect(response).toBe(true)
                done()
            })
        })


    })

    describe('when ACL is private', () => {
        beforeEach(() => {
            AWSMock.mock('S3', 'getBucketAcl', awsMockCallback('test-data/getBucketAcl-private.json'));
        })

        it('should return true if the bucket policy is publicly readable', async (done) => {
            AWSMock.mock('S3', 'getBucketPolicy', awsMockCallback('test-data/getBucketPolicy-public.json'));
            let response = await S3.bucket(bucketName).isPubliclyAccessible()
            expect(response).toBe(true)
            done()
        })

        it('should return false if the bucket policy is contains anonymous user, but denies access', async (done) => {
            AWSMock.mock('S3', 'getBucketPolicy', awsMockCallback('test-data/getBucketPolicy-denyAnonymous.json'));
            let response = await S3.bucket(bucketName).isPubliclyAccessible()
            expect(response).toBe(false)
            done()
        })

        it('should return false if the bucket policy does not exist', async (done) => {
            AWSMock.mock('S3', 'getBucketPolicy', awsMockFailureCallback('test-data/getBucketPolicy-none.json'));
            let response = await S3.bucket(bucketName).isPubliclyAccessible()
            expect(response).toBe(false)
            done()
        })

        it('should fail if the bucket does not exist', async(done) => {
            AWSMock.mock('S3', 'getBucketPolicy', awsMockFailureCallback('test-data/getBucketPolicy-notExist.json'));
            try{

                await S3.bucket(bucketName).isPubliclyAccessible()
                fail('Exception should be thrown')
            }catch(err){
                done()
            }
        })
    })





    // it('should return false if access logging is disabled', async (done) => {
    //     // Note - disabled is a successful response
    //     AWSMock.mock('S3', 'getBucketAcl', awsMockCallback('test-data/getBucketAcl-disabled.json'));
    //     let result = await S3.bucket(bucketName).isPubliclyAccessible()
    //     expect(result).toBe(false)
    //     done()
    // })

    // it('should fail if the bucket does not exist', async(done)=> {
    //     AWSMock.mock('S3', 'getBucketAcl', awsMockFailureCallback('test-data/getBucketAcl-notExist.json'));
    //     try{
    //         await S3.bucket(bucketName).isPubliclyAccessible()
    //         fail('Exception should be thrown')
    //     }catch (err){
    //         done()
    //     }
    // })
})