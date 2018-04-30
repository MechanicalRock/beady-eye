const s3Bucket = (name: string) => {

    return {
        toString: () => `S3 Bucket: ${name}`
    }
}

export const S3 =  {
    bucket: s3Bucket
}
