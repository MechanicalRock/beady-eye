import {S3} from "../src/S3"
import AWSMock = require('aws-sdk-mock')
import fs = require('fs')

let awsMockCallback = (filename) => {
    let response = fs.readFileSync(filename)

    return function(params,callback){
        callback(null,response)
    }
}
let awsMockFailureCallback = (filename) => {
    let response = fs.readFileSync(filename)
    return function(params,callback){
        callback(response)
    }
}

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

        describe('#shouldBeReadable', ()=> {
            it('should be defined', ()=> {
                expect(bucket.shouldBeReadable).toBeDefined()
            })

            describe('when the bucket exists', ()=> {

                beforeEach(()=> {
                    AWSMock.mock('S3', 'headBucket', awsMockCallback('test-data/headBucket-exists.json'));
                })

                afterEach(()=>{
                    AWSMock.restore('S3');
                })

                it('should succeed when the bucket exists', async (done)=> {
                    let response = await S3.bucket(bucketName).shouldExist()
                    expect(response).toBe(true)
                    done()
                })
            })
            describe('when the bucket does not exist', ()=> {

                beforeEach(()=> {
                    AWSMock.mock('S3', 'headBucket', awsMockFailureCallback('test-data/headBucket-notExists.json'));
                })

                afterEach(()=>{
                    AWSMock.restore('S3');
                })

                it('should throw an error', async (done)=> {
                    try{
                        await S3.bucket(bucketName).shouldExist()
                        fail('exception not thrown')
                    }catch(err){
                        done()
                    }
                })
            })

        })
    })
})