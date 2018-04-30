
import { Credentials, S3 as AwsS3 } from 'aws-sdk'
import { IamRole } from './IAM'
import { expect } from 'chai'

class S3Bucket {
    name;
    role;
    lazyS3Client: AwsS3
    bucketParams;

    constructor(name: string, role?: IamRole) {
        this.name = name
        this.role = role
        this.bucketParams = { Bucket: this.name }

    }

    async s3Client() {

        if (this.lazyS3Client) {
            return this.lazyS3Client
        } else {
            let temporaryCreds = this.role ? await this.role.credentials() : undefined
            this.lazyS3Client = new AwsS3({ params: this.bucketParams, credentials: temporaryCreds })
            return this.lazyS3Client
        }
    }

    toString() {
        return `S3 Bucket: ${this.name}`
    }

    async shouldExist() {
        let s3 = (await this.s3Client())
        let response = await s3.headBucket(this.bucketParams).promise()
        expect(response).not.to.be.undefined
        return true
    }
    
    async shouldBeReadable() {
        let s3 = (await this.s3Client())
        let response = await s3.listObjects(this.bucketParams).promise()
        expect(response).not.to.be.undefined
        return true
    }

    async shouldNotBeReadable() {
        // try {
        //     let response = await promise()
        //     fail(failureMessage)
        //   } catch (e) {
        //     expect(e.code).toEqual('AccessDenied')
        //   }
    }

    async shouldBeEncrypted() {
        let s3 = (await this.s3Client())
        let response = await s3.getBucketEncryption(this.bucketParams).promise()
        expect(response).not.to.be.undefined

        let rules = response.ServerSideEncryptionConfiguration &&
            response.ServerSideEncryptionConfiguration.Rules ? response.ServerSideEncryptionConfiguration.Rules : []
        expect(rules).to.deep.include({ ApplyServerSideEncryptionByDefault: { SSEAlgorithm: 'AES256' } })
        return true
    }

    async shouldHaveAccessLoggingEnabled() {
        //   let response = await s3.getBucketLogging().promise().catch((err) => { console.log(err)})
        //   expect(response).toBeDefined()
        //   expect(response.LoggingEnabled).toBeDefined()            
    }

    async shouldHaveVersioningEnabled() {
        // let response = await s3.getBucketVersioning().promise()
        // expect(response).toBeDefined()
        // expect(response.Status).toEqual('Enabled')
    }

    async shouldHaveLifecycleRule(lifeCycleRule) {
        // let response = await s3.getBucketLifecycleConfiguration().promise()
        // expect(response.Rules).toBeDefined()

        // let expectedRule = {
        //   ID: jasmine.any(String),
        //   Filter: jasmine.any(Object),
        //   Status: "Enabled",
        //   Transitions: jasmine.objectContaining([{
        //     Days: 90,
        //     StorageClass: "STANDARD_IA"
        //   }]),
        //   NoncurrentVersionTransitions : jasmine.objectContaining([{
        //     NoncurrentDays: 90,
        //     StorageClass: "STANDARD_IA"
        //   }])
        // }
        // expect(response.Rules).toContain(expectedRule)

    }

    async shouldNotBePubliclyAccessible() {
        //   const allUsersURI = 'http://acs.amazonaws.com/groups/global/AllUsers'
        //   const authenticatedUsersURI = 'http://acs.amazonaws.com/groups/global/AuthenticatedUsers'
        //   const readAllUsers = { Grantee: { URI: allUsersURI,  Type : "Group"},Permission : jasmine.any(String)}
        //   const readAuthUsers = { Grantee: { URI: authenticatedUsersURI, Type : "Group"}, Permission : jasmine.any(String) }

        //   // interrogate the bucket ACLs
        //   let aclResponse = await s3.getBucketAcl().promise()
        //   expect(aclResponse.Grants).not.toContain(readAllUsers,"All users have access to this buckets")
        //   expect(aclResponse.Grants).not.toContain(readAuthUsers,"AuthenticatedUsers have access to this bucket")

        //   // interrogate the bucket policy
        //   try{
        //     let policyResponse = await s3.getBucketPolicy().promise()
        //     expect(policyResponse).toBeDefined()

        //     let anonymousAccessStatement = jasmine.objectContaining({
        //       Effect: "Allow",
        //       Principal: "*",
        //     })

        //     var policy = JSON.parse(policyResponse.Policy)
        //     expect(policy.Statement).not.toContain(anonymousAccessStatement)

        //   }catch(err) {
        //     // No bucket policy means a private bucket
        //     expect(err.toString()).toContain('NoSuchBucketPolicy')
        //   }

    }
}

const s3Bucket = (name: string, role?: IamRole) => {

    return new S3Bucket(name, role)
}

export const S3 = {
    bucket: s3Bucket
}
export default S3