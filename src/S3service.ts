import {S3 as AWS_S3} from 'aws-sdk'

export const S3service = () => {
    return new AWS_S3()
} 

export default S3service