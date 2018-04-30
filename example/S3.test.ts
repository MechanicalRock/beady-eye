import { S3,IAM } from '../src/index'

let bucket = S3.bucket('myBucket')
xdescribe(bucket.toString(), ()=> {

    
    let asDeveloperRole = IAM.role({roleName: 'DeveloperRole',
    accountId: '0123456789'})
    describe(`${asDeveloperRole} access`, () => {
        
        let bucket = S3.bucket('myBucket', asDeveloperRole)
        it("should exist", async () => {
            await bucket.shouldExist()
        })
    })
})

