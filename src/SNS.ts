import { SNS } from "aws-sdk";
import { IamRole } from "./IAM";

export class SNSTopic {
    private snsClient: SNS;

    constructor(private topicArn: string, private role?: IamRole) { }

    public shouldExist = async (): Promise<boolean> => {
        const sns = await this.initSns();
        const topicAttributes = (await sns.getTopicAttributes({
            TopicArn: this.topicArn,
        }).promise()).Attributes;

        expect(topicAttributes).not.toBeUndefined();
        return true;
    }

    public isEncryptedAtRest = async (): Promise<boolean> => {
        const sns = await this.initSns();
        const topicAttributes = (await sns.getTopicAttributes({
            TopicArn: this.topicArn,
        }).promise()).Attributes;
        expect(topicAttributes).not.toBeUndefined();

        const kmsKeyId = topicAttributes!.KmsMasterKeyId;
        // tslint:disable-next-line:no-console
        console.log(`KMS Key Id: ${kmsKeyId}`);
        expect(kmsKeyId).not.toBeUndefined();
        return true;
    }

    private initSns = async () => {
        if (this.snsClient) {
            return this.snsClient;
        } else {
            const tempCreds = this.role ? await this.role.credentials() : undefined;
            return new SNS({
                credentials: tempCreds,
            });
        }
    }
}

const snsTopic = (topicArn: string, role?: IamRole) => {
    return new SNSTopic(topicArn, role);
};

export const _SNS = {
    topic: snsTopic,
};

export default _SNS;
