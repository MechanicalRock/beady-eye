import {S3} from '../../src/S3'
import AWSMock = require('aws-sdk-mock')


describe ("S3 module", () => {

    describe("#bucket()", ()=> {
        let bucketName = "myS3Bucket"
        let bucket = S3.bucket(bucketName)
        
        
        it('should be defined', ()=> {
            expect(bucket).toBeDefined()
        })

        it('should provide a string representation including the bucket name', () => {
            expect(bucket.toString).toBeDefined()
            expect(bucket.toString()).toEqual("S3 Bucket: myS3Bucket")
        })

    })
})