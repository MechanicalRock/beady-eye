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

