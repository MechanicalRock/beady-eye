
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

    async canListContents() {
        let s3 = (await this.s3Client())
        try{
            let response = await s3.listObjects(this.bucketParams).promise()
            expect(response).not.to.be.undefined
            return true
        }catch(err){
            expect(err.code).to.equal('AccessDenied')
            return false
        }
    }

    async hasEncryptionByDefault() {
        let s3 = (await this.s3Client())
        try{
            let response = await s3.getBucketEncryption(this.bucketParams).promise()
            expect(response).not.to.be.undefined
            return true
        }catch(err){
            expect(err.code).to.equal('ServerSideEncryptionConfigurationNotFoundError')
            return false
        }
    }

    async hasAccessLogging() {
        let s3 = (await this.s3Client())
        let response = await s3.getBucketLogging(this.bucketParams).promise()
        expect(response).not.to.be.undefined
        if (response.LoggingEnabled){
            return true
        }else {
            return false
        }
    }
    
    async hasVersioningEnabled() {
        let s3 = (await this.s3Client())
        let response = await s3.getBucketVersioning(this.bucketParams).promise()
        expect(response).not.to.be.undefined
        return response.Status == 'Enabled'
    }

    async hasLifecycleRule(lifeCycleRule) {
        let s3 = (await this.s3Client())
        let response = await s3.getBucketLifecycleConfiguration(this.bucketParams).promise()
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

    async isPubliclyAccessible() {
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