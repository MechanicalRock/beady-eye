import { Credentials, CloudFront as AwsCloudFront } from 'aws-sdk'
import { IamRole, IAM } from './IAM'
import { S3, S3Bucket } from './S3';
import { expect } from 'chai'
import { isMatch } from 'lodash'

class CloudFrontDistribution {
    domainName;
    distributionId;
    role;
    cloudFrontParams;
    lazyAWSCloudFrontClient: AwsCloudFront
    

    constructor(distributionId: string, role?: IamRole) {
        this.distributionId = distributionId;
        this.role = role;
        this.cloudFrontParams = { Id: this.distributionId };
    }

    toString() {
        return `Cloud Front Distribution: ${this.distributionId}`
    }

    async cloudFrontClient() {
        if (this.lazyAWSCloudFrontClient) {
            return this.lazyAWSCloudFrontClient;
        } else {
            let temporaryCreds = this.role ? await this.role.credentials() : undefined
            this.lazyAWSCloudFrontClient = new AwsCloudFront({ params: this.cloudFrontParams, credentials: temporaryCreds })
            return this.lazyAWSCloudFrontClient;
        }
    }
    async shouldExist() {
        let cloudFrontClient = (await this.cloudFrontClient());
        try {
            let response = await cloudFrontClient.getDistribution(this.cloudFrontParams).promise()
            expect(response).not.to.be.undefined;
            expect(response.Distribution).not.to.be.undefined;
            return true;
        } catch (error ) { 
            return false;
        }
    }

    async isSendingLogsWithin( periodHours: number, logsBucket: S3Bucket){
        const prefix = this.generateS3ObjectPrefix(new Date(), periodHours);
        return(await logsBucket.containsFileWithPrefix(prefix));
    }

    // async logBucketWithCFLogs(bucketName: string, prefix: string ){
    //     const targetRole = IAM.role({
    //         roleArn: this.role? this.role.role: undefined,
    //       })
    //     let s3Bucket = S3.bucket(this.logsBucketName, targetRole);
    //     return(await s3Bucket.containsFileWithPrefix(prefix));
    // }
    
    generateS3ObjectPrefix( keyDate: Date, periodHours: number) : string {
        let earliestDate  = new Date((keyDate.getTime() - ( periodHours * 60 * 60 * 1000 )));
        const earliestDateString = (earliestDate).toISOString().substring(0,10);
        return(`${this.distributionId}.${earliestDateString}`);
    }

}

const cloudFrontDistribution = ( distributionId: string, role?: IamRole) => {
    return(new CloudFrontDistribution(distributionId, role));
}

export const CloudFront = {
    distribution : cloudFrontDistribution
}
