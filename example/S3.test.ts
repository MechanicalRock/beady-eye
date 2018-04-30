import { S3,IAM } from '../src/index'

let bucket = S3.bucket('myBucket')
describe(bucket.toString(), () => {

    let asDeveloperRole = IAM.role('DeveloperRole')
    describe(`${asDeveloperRole} access`, () => {

        let bucket = S3.bucket('myBucket', asDeveloperRole)
        it("should be readable", () => {
            bucket.shouldBeReadable()
            // expect(bucket.toBeReadable()).toBeTrue()
        })
    })
})