import { S3 } from 'aws-sdk'
import fs = require('fs')
import { IAM } from '../src/IAM'

const approvalTest = async () => {
    try {
        let accountId: string = process.env['AWS_ACCOUNT_ID'] || 'unknown'
        var credentials = await IAM.role({
            roleName: 'AdminRole',
            accountId: accountId,
        }).credentials()

        var s3 = new S3({ credentials: credentials })

        let existingBucketName = 's3001remediate'
        let nonExistingBucketName = 'thisBucketShouldNotExist'

        s3.headBucket({ Bucket: existingBucketName }).promise().then(writeTo('headBucket-exists.json'))
        s3.headBucket({ Bucket: nonExistingBucketName }).promise().catch(writeTo('headBucket-notExists.json'))
        
        s3.getBucketEncryption({ Bucket: 's3-021-compliant' }).promise().then(writeTo('getBucketEncryption-encrypted.json'))
        s3.getBucketEncryption({ Bucket: nonExistingBucketName }).promise().catch(writeTo('getBucketEncryption-notExist.json'))
        
        s3.listObjects({ Bucket: existingBucketName }).promise().then(writeTo('listObjects-granted.json')).catch(console.log)
        s3.listObjects({ Bucket: existingBucketName }).promise().catch(writeTo('listObjects-denied.json'))
        s3.listObjects({ Bucket: nonExistingBucketName }).promise().catch(writeTo('listObjects-notExist.json'))
        
        // uncomment desired version (manual setup required)
        s3.getBucketLogging({ Bucket: existingBucketName }).promise().then(writeTo('getBucketLogging-enabled.json'))
        // s3.getBucketLogging({ Bucket: existingBucketName }).promise().then(writeTo('getBucketLogging-disabled.json'))
        s3.getBucketLogging({ Bucket: nonExistingBucketName }).promise().catch(writeTo('getBucketLogging-notExist.json'))
    }
    catch (err) {
        console.log("Test data generation failed: " + err)
    }

}
const writeTo = (filename) => {
    return (result) => {
        fs.writeFileSync(`test-data/${filename}`, JSON.stringify(result))
    }
}

approvalTest()

