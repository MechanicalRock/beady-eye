import * as AWSMock from "aws-sdk-mock";
import * as ssm from "../../src/SSM";
import { awsMockCallback, awsMockFailureCallback } from "../support";

describe("SSMParameter#Exists", () => {
  afterEach(() => {
    AWSMock.restore("SSM");
  });

})