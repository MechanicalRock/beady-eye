import { S3 } from '../../src/S3'
import { awsMockCallback } from '../support'
import * as AWSMock from 'aws-sdk-mock'

describe('S3.bucket#containsFileWithPrefix', () => {
    let bucketName = "myS3Bucket"
    let bucketKey = "test/my-key"

    afterEach(() => {
        AWSMock.restore('S3');
    })

    it('should return true when an object with given prefix exists and permission granted', async (done) => {
        AWSMock.mock('S3', 'listObjectsV2', awsMockCallback('test-data/listObjects-granted.json'));
        let response = await S3.bucket(bucketName).containsFileWithPrefix('myprefix.txt');
        expect(response).toBe(true)
        done();
    })
    it('should return false when an object with given prefix does exists and permission granted', async (done) => {
        AWSMock.mock('S3', 'listObjectsV2', awsMockCallback('test-data/listObjects-notExist.json'));
        let response = await S3.bucket(bucketName).containsFileWithPrefix('myprefix.txt');
        expect(response).toBe(false)
        done();
    })
    it('should return false when permission is denied', async (done) => {
        AWSMock.mock('S3', 'listObjectsV2', awsMockCallback('test-data/listObjects-denied.json'));
        let response = await S3.bucket(bucketName).containsFileWithPrefix('myprefix.txt');
        expect(response).toBe(false)
        done();
    })

});