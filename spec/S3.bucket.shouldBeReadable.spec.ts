describe('S3.bucket#shouldBeReadable', () => {
    let bucketName = "myS3Bucket"

    afterEach(() => {
        AWSMock.restore('S3');
    })

    it('should succeed if the bucket contents can be listed')
    it('should fail if the bucket contents cannot be listed')
    it('should fail if the bucket does not exist')

})