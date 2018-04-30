import {S3} from "../src/S3"
import AWSMock = require('aws-sdk-mock')
import {S3service} from '../src/S3service'

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

        it('should verify that a bucket exists when it does exist', () => {
            AWSMock.mock('S3','headBucket','Not found')
            //expect(bucket.shouldExist()).toBe(true)
            AWSMock.restore('S3','headBucket')
        })

        it('should verify a bucket does not exist when it does not exist',() => {

        })
    })
})