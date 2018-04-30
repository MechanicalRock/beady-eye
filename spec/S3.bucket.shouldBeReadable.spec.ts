import { S3 } from "../src/S3"
import { awsMockCallback, awsMockFailureCallback } from './support'
import AWSMock = require('aws-sdk-mock')

describe('S3.bucket#shouldBeReadable', () => {
    let bucketName = "myS3Bucket"

    afterEach(() => {
        AWSMock.restore('S3');
    })

    it('should succeed if the bucket contents can be listed', async (done)=> {
        AWSMock.mock('S3', 'listObjects', awsMockCallback('test-data/listObjects-granted.json'));

        let response = await S3.bucket(bucketName).shouldBeReadable()
        expect(response).toBe(true)
        done()
    })
    it('should fail if the bucket contents cannot be listed')
    it('should fail if the bucket does not exist')

})