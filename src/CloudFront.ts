import { Credentials, CloudFront as AwsCloudFront } from 'aws-sdk'
import { IamRole, IAM } from './IAM'
import { S3, S3Bucket } from './S3';
import { expect } from 'chai'
import { isMatch } from 'lodash'

export class CloudFrontDistribution {
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
            expect(error.code).to.equal('NoSuchDistribution');
            return false;
        }
    }

    async isSendingLogsWithin( periodHours: number, logsBucket: S3Bucket){
        const prefix = new CFLogsS3Object(this.distributionId).generateIdPrefix(new Date(), periodHours);
        return(await logsBucket.containsFileWithPrefix(prefix));
    }
}

const cloudFrontDistribution = ( distributionId: string, role?: IamRole) => {
    return(new CloudFrontDistribution(distributionId, role));
}

export const CloudFront = {
    distribution : cloudFrontDistribution
}
export class CFLogsS3Object {
    distributionId;
    constructor(distributionId:string) {
        this.distributionId = distributionId;
    }
    generateIdPrefix( keyDate: Date, periodHours: number) : string {
        let earliestDate  = new Date((keyDate.getTime() - ( periodHours * 60 * 60 * 1000 )));
        const earliestDateString = (earliestDate).toISOString().substring(0,10);
        return(`${this.distributionId}.${earliestDateString}`);
    }
}
