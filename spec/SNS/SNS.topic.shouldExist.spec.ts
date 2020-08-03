import * as AWSMock from "aws-sdk-mock";
import { _SNS } from "../../src/SNS";
import { awsMockCallback, awsMockFailureCallback } from "../support";

describe("SNSTopic#shouldExist", () => {
  const topicArn =
    "arn:aws:sns:ap-southeast-2:123451234566:cicd-notifications-sns-topic";

  afterEach(() => {
    AWSMock.restore("SNS");
  });

  it("should return true when the topic exists", async (done) => {
    AWSMock.mock(
      "SNS",
      "getTopicAttributes",
      awsMockCallback("test-data/sns/topic-exists.json")
    );

    const exists = await _SNS.topic(topicArn).shouldExist();
    expect(exists).toBe(true);
    done();
  });

  it("should throw an error when the topic does not exist", async (done) => {
    AWSMock.mock(
      "SNS",
      "getTopicAttributes",
      awsMockFailureCallback("test-data/sns/topic-notExists.json")
    );
    try {
      await _SNS.topic(topicArn).shouldExist();
      fail("exception not thrown");
      done();
    } catch (err) {
      done();
    }
  });
});
