import * as AWSMock from "aws-sdk-mock";
import { DynamoDb } from "../../src/DynamoDb";
import { awsMockCallback, awsMockFailureCallback } from "../support";

describe("DynamoDb.table#shouldExist", () => {
    const tableName = "myDdbTable";

    afterEach(() => {
        AWSMock.restore("DynamoDB");
    });

    it("should succeed when the table exists", async (done) => {
        AWSMock.mock("DynamoDB", "describeTable", awsMockCallback("test-data/dynamodb/describeTable-exists.json"));

        const response = await DynamoDb.table(tableName).shouldExist();
        expect(response).not.toBe(undefined);
        done();
    });

    it("should throw an error when the table does not exist", async (done) => {
        AWSMock.mock(
            "DynamoDB",
            "describeTable",
            awsMockFailureCallback("test-data/dynamodb/describeTable-notExists.json"));

        try {
            await DynamoDb.table(tableName).shouldExist();
            fail("exception not thrown");
            done();
        } catch (err) {
            done();
        }
    });
});
