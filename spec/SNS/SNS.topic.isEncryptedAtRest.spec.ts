import * as AWSMock from "aws-sdk-mock";
import { _SNS } from "../../src/SNS";
import { awsMockCallback, awsMockFailureCallback } from "../support";

describe("SNSTopic#isEncryptedAtRest", () => {
    const topicArn = "arn:aws:sns:ap-southeast-2:123451234566:cicd-notifications-sns-topic";

    afterEach(() => {
        AWSMock.restore("SNS");
    });

    it("should return true when the topic is encrypted", async (done) => {
        AWSMock.mock("SNS", "getTopicAttributes", awsMockCallback("test-data/sns/topic-is-encrypted.json"));

        const isEncrypted = await _SNS.topic(topicArn).isEncryptedAtRest();
        expect(isEncrypted).toBe(true);
        done();
    });

    it("should throw an error when the topic is not encrypted", async (done) => {
        AWSMock.mock(
            "SNS",
            "getTopicAttributes",
            awsMockFailureCallback("test-data/sns/topic-not-encrypted.json"));
        try {
            await _SNS.topic(topicArn).isEncryptedAtRest();
            fail("exception not thrown");
            done();
        } catch (err) {
            done();
        }
    });
});
