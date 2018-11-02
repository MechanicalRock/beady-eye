
import { Credentials, S3 as AwsS3 } from 'aws-sdk'
import { IamRole } from './IAM'
import { expect } from 'chai'
import { isMatch } from 'lodash'

export class S3Bucket {
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
        try {
            let response = await s3.listObjects(this.bucketParams).promise()
            expect(response).not.to.be.undefined
            return true
        } catch (err) {
            expect(err.code).to.equal('AccessDenied')
            return false
        }
    }

    async hasEncryptionByDefault() {
        let s3 = (await this.s3Client())
        try {
            let response = await s3.getBucketEncryption(this.bucketParams).promise()
            expect(response).not.to.be.undefined
            return true
        } catch (err) {
            expect(err.code).to.equal('ServerSideEncryptionConfigurationNotFoundError')
            return false
        }
    }

    async hasAccessLogging() {
        let s3 = (await this.s3Client())
        let response = await s3.getBucketLogging(this.bucketParams).promise()
        expect(response).not.to.be.undefined
        if (response.LoggingEnabled) {
            return true
        } else {
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
        const allUsersURI = 'http://acs.amazonaws.com/groups/global/AllUsers'
        const authenticatedUsersURI = 'http://acs.amazonaws.com/groups/global/AuthenticatedUsers'
        //   const readAllUsers = { Grantee: { URI: allUsersURI,  Type : "Group"},Permission : jasmine.any(String)}
        //   const readAuthUsers = { Grantee: { URI: authenticatedUsersURI, Type : "Group"}, Permission : jasmine.any(String) }
        const readAllUsers = { Grantee: { URI: allUsersURI, Type: "Group" } }
        const readAuthUsers = { Grantee: { URI: authenticatedUsersURI, Type: "Group" } }

        // interrogate the bucket ACLs
        let s3 = (await this.s3Client())
        let aclResponse = await s3.getBucketAcl(this.bucketParams).promise()

        let containsGrant = (toMatch) => {
            return aclResponse.Grants && aclResponse.Grants.find(grant => isMatch(grant, toMatch)) != undefined
        }

        if (containsGrant(readAllUsers) || containsGrant(readAuthUsers)) {
            return true
        }


        // interrogate the bucket policy
        try {
            let policyResponse = await s3.getBucketPolicy(this.bucketParams).promise()
            expect(policyResponse).not.to.be.undefined

            let anonymousAccessStatement = {
                Effect: "Allow",
                Principal: "*",
            }


            if (policyResponse.Policy) {
                var policy = JSON.parse(policyResponse.Policy)
                let containsStatement = (toMatch) => {
                    return policy.Statement && policy.Statement.find(statement => isMatch(statement, toMatch)) != undefined
                }

                if (containsStatement(anonymousAccessStatement)) {
                    return true
                }



                // expect(policy.Statement).not.toContain(anonymousAccessStatement)

            }

        } catch (err) {
            // No bucket policy means a private bucket
            expect(err.code).to.equal('NoSuchBucketPolicy')
        }

        return false
    }

    async canGetObject(key: string) {
        let s3 = (await this.s3Client())
        try {
            let response = await s3.getObject({ Bucket: this.name, Key: key }).promise()
            return true
        } catch (e) {
            expect(e.code).to.equal('AccessDenied')
            return false
        }
    }
    async containsFileWithPrefix(prefix: string) {
        let s3 = (await this.s3Client())
        try {
            
            let response = await s3.listObjectsV2({
                Bucket: this.name,
                Prefix : prefix,
                MaxKeys: 1
            }).promise();
            if(response.Contents && response.Contents.length>0) {
                return true;
            } else {
                return false;
            }
        } catch (e) {
            expect(e.code).to.equal('AccessDenied')
            return false
        }
    }
    async canPutObject(key: string) {

        let s3 = (await this.s3Client())
        try {
            let response = await s3.putObject({ Bucket: this.name, Key: key, Body: 'sample data' }).promise()
            return true
        } catch (e) {
            expect(e.code).to.equal('AccessDenied')
            return false
        }
    }

    async canDeleteObject(key:string) {
        let s3 = (await this.s3Client())
        try {
            let response = await s3.deleteObject({ Bucket: this.name, Key: key}).promise()
            return true
        } catch (e) {
            expect(e.code).to.equal('AccessDenied')
            return false
        }
    }
}

const s3Bucket = (name: string, role?: IamRole) => {

    return new S3Bucket(name, role)
}

export const S3 = {
    bucket: s3Bucket
}
export default S3