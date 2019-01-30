import { SNS } from "aws-sdk";
import { IamRole } from "./IAM";

export class SNSTopic {
    private snsClient: SNS;

    constructor(private topicArn: string, private role?: IamRole) { }

    public shouldExist = async () => {
        const sns = await this.initSns();
        const topicAttributesResponse = await sns.getTopicAttributes({
            TopicArn: this.topicArn,
        }).promise();
        expect(topicAttributesResponse).not.toBeUndefined();

        const attributesMap = topicAttributesResponse.Attributes as SNS.TopicAttributesMap;
        const topicDisplayName = attributesMap.DisplayName;
        expect(topicDisplayName).not.toBeUndefined();
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
