// tslint:disable:no-unused-expression
import { DynamoDB } from "aws-sdk";
import { expect } from "chai";
import { IamRole } from "./IAM";

export class DynamoDbTable {
  private dynamoDbClient: DynamoDB;
  constructor(private tableName: string, private role?: IamRole) {}

  public shouldExist = async (): Promise<boolean> => {
    const dynamoDb = await this.initDynamoDb();
    const table = (
      await dynamoDb
        .describeTable({
          TableName: this.tableName,
        })
        .promise()
    ).Table;

    expect(table).not.to.be.undefined;
    return true;
  };

  public hasEncryptionByDefault = async (): Promise<boolean> => {
    const dynamoDb = await this.initDynamoDb();
    const table = (
      await dynamoDb.describeTable({ TableName: this.tableName }).promise()
    ).Table!;

    const encryptionStatus = (table as DynamoDB.TableDescription)
      .SSEDescription!;
    expect(encryptionStatus.Status).to.equal("ENABLED");
    return true;
  };

  private initDynamoDb = async (): Promise<DynamoDB> => {
    if (this.dynamoDbClient) {
      return this.dynamoDbClient;
    } else {
      const tempCreds = this.role ? await this.role.credentials() : undefined;
      return new DynamoDB({
        credentials: tempCreds,
      });
    }
  };
}

const dynamoDbTable = (name: string, role?: IamRole) => {
  return new DynamoDbTable(name, role);
};

export const DynamoDb = {
  table: dynamoDbTable,
};

export default DynamoDb;
