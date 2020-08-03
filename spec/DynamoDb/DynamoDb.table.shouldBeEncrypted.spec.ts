import * as AWSMock from "aws-sdk-mock";
import { DynamoDb } from "../../src/DynamoDb";
import { awsMockCallback, awsMockFailureCallback } from "../support";

describe("DynamoDb.table#shouldBeEncrypted", () => {
  const tableName = "myDdbTable";

  afterEach(() => {
    AWSMock.restore("DynamoDB");
  });

  it("should succeed when the table is encrypted", async (done) => {
    AWSMock.mock(
      "DynamoDB",
      "describeTable",
      awsMockCallback("test-data/dynamodb/table-encrypted.json")
    );

    const response = await DynamoDb.table(tableName).hasEncryptionByDefault();
    expect(response).toBe(true);
    done();
  });

  it("should throw an error if the table is unencrypted", async (done) => {
    AWSMock.mock(
      "DynamoDB",
      "makeUnauthenticatedRequest",
      awsMockFailureCallback("test-data/dynamodb/table-unencrypted.json")
    );

    try {
      await DynamoDb.table(tableName).hasEncryptionByDefault();
      fail("Expected an exception to be thrown");
      done();
    } catch (error) {
      done();
    }
  });
});
