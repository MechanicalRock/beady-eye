import { S3 } from '../../src/S3'
import { awsMockCallback, awsMockFailureCallback } from '../support'
import AWSMock = require('aws-sdk-mock')

describe('S3.bucket#canGetObject', () => {
    let bucketName = "myS3Bucket"
    let bucketKey = "test/my-key"

    afterEach(() => {
        AWSMock.restore('S3');
    })

    it('should return true when object exists and permission granted', async (done) => {
        AWSMock.mock('S3', 'getObject', awsMockCallback('test-data/getObject-granted.json'));

        let response = await S3.bucket(bucketName).canGetObject(bucketKey)
        expect(response).toBe(true)
        done()
    })

    it('should return false when object exists and permission denied', async (done) => {
        AWSMock.mock('S3', 'getObject', awsMockFailureCallback('test-data/getObject-denied.json'));

        let response = await S3.bucket(bucketName).canGetObject(bucketKey)
        expect(response).toBe(false)
        done()
    })

    it('should throw an error when the requested key does not exist', async (done) => {
        AWSMock.mock('S3', 'getObject', awsMockFailureCallback('test-data/getObject-errorNoSuchKey.json'));

        try {
            await S3.bucket(bucketName).canGetObject(bucketKey)
            fail('exception not thrown')
        } catch (err) {
            done()
        }
    })

    it('should throw an error when the bucket does not exist', async (done) => {
        AWSMock.mock('S3', 'getObject', awsMockFailureCallback('test-data/getObject-notExist.json'));

        try {
            await S3.bucket(bucketName).canGetObject(bucketKey)
            fail('exception not thrown')
        } catch (err) {
            done()
        }
    })

})