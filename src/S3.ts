
import {S3service} from './S3service'

const s3Bucket = (name: string, role:string = "") => {
    return {
        toString: () => `S3 Bucket: ${name}`,
        
        shouldBeReadable: () => {

        },
        shouldExist : async () => {
            try {
                await S3service().headBucket({Bucket:name})
            } catch (e) {
                return false
            }
            // let params = {}
            // let response = {}
            //  s3.headBucket(params).promise()
            //   .then( (r) => {
            //     response = r
            //     console.log(response)
            //     done()
            //   })
            //   .catch( (e) => {
            //       console.log(e)
            //   })
            // expect(response).toBeDefined()
        },
        
        shouldBeEncrypted : () => {
            // let response = await s3.getBucketEncryption().promise()
            // expect(response).toBeDefined()
            // expect(response.ServerSideEncryptionConfiguration)
            // expect(response.ServerSideEncryptionConfiguration.Rules).toContain( { ApplyServerSideEncryptionByDefault: {  SSEAlgorithm: 'AES256'} } )        
        },
  
        shouldHaveAccessLoggingEnabled : () => {
        //   let response = await s3.getBucketLogging().promise().catch((err) => { console.log(err)})
        //   expect(response).toBeDefined()
        //   expect(response.LoggingEnabled).toBeDefined()            
        },


  
        shouldHaveVersioningEnabled : () => {
            // let response = await s3.getBucketVersioning().promise()
            // expect(response).toBeDefined()
            // expect(response.Status).toEqual('Enabled')
        },
  
        shouldHaveLifecycleRule : (lifeCycleRule) => {
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
  
        },
        
        shouldNotBePubliclyAccessible : () => {
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
  
}

export const S3 =  {
    bucket: s3Bucket,
}
export default S3