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
        // s3.getBucketLogging({ Bucket: existingBucketName }).promise().then(writeTo('getBucketLogging-enabled.json'))
        // s3.getBucketLogging({ Bucket: existingBucketName }).promise().then(writeTo('getBucketLogging-disabled.json'))
        s3.getBucketLogging({ Bucket: nonExistingBucketName }).promise().catch(writeTo('getBucketLogging-notExist.json'))
        
        
        // uncomment desired version (manual setup required)
        // s3.getBucketVersioning({ Bucket: existingBucketName }).promise().then(writeTo('getBucketVersioning-enabled.json'))
        // s3.getBucketVersioning({ Bucket: existingBucketName }).promise().then(writeTo('getBucketVersioning-disabled.json'))
        s3.getBucketVersioning({ Bucket: nonExistingBucketName }).promise().catch(writeTo('getBucketVersioning-notExist.json'))
        
        
        // uncomment desired version (manual setup required)
        // s3.getBucketAcl({ Bucket: existingBucketName }).promise().then(writeTo('getBucketAcl-publicReadAllUsers.json'))
        // s3.getBucketAcl({ Bucket: existingBucketName }).promise().then(writeTo('getBucketAcl-private.json'))
        s3.getBucketAcl({ Bucket: nonExistingBucketName }).promise().catch(writeTo('getBucketAcl-notExist.json'))
        
        // uncomment desired version (manual setup required)
        // s3.getBucketPolicy({ Bucket: existingBucketName }).promise().then(writeTo('getBucketPolicy-denyAnonymous.json'))
        // s3.getBucketPolicy({ Bucket: existingBucketName }).promise().then(writeTo('getBucketPolicy-public.json'))
        s3.getBucketPolicy({ Bucket: existingBucketName }).promise().catch(writeTo('getBucketPolicy-none.json'))
        s3.getBucketPolicy({ Bucket: nonExistingBucketName }).promise().catch(writeTo('getBucketPolicy-notExist.json'))

        let existingFile = 'test/existingFile'
        let nonExistingFile = 'test/nonExistingFile'

        s3.putObject({Bucket: existingBucketName, Body : 'sample',Key : existingFile}).promise().then(writeTo('putObject-granted.json')).catch(writeTo('putObject-denied.json'))
        s3.putObject({Bucket: nonExistingBucketName, Body : 'sample',Key : existingFile}).promise().catch(writeTo('putObject-notExist.json'))
        
        s3.getObject({Bucket: existingBucketName, Key : existingFile}).promise().then(writeTo('getObject-granted.json')).catch(writeTo('getObject-denied.json'))
        s3.getObject({Bucket: existingBucketName, Key : nonExistingFile}).promise().then(writeTo('getObject-noSuchKey.json')).catch(writeTo('getObject-errorNoSuchKey.json'))
        s3.getObject({Bucket: nonExistingBucketName, Key : existingFile}).promise().catch(writeTo('getObject-notExist.json'))
        
        s3.deleteObject({Bucket: existingBucketName, Key : existingFile}).promise().then(writeTo('deleteObject-granted.json')).catch(writeTo('deleteObject-denied.json'))
        s3.deleteObject({Bucket: existingBucketName, Key : nonExistingFile}).promise().then(writeTo('deleteObject-noSuchKey.json')).catch(writeTo('deleteObject-errorNoSuchKey.json'))
        s3.deleteObject({Bucket: nonExistingBucketName, Key : existingFile}).promise().catch(writeTo('deleteObject-notExist.json'))
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

