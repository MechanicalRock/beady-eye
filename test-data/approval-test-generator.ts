import { S3, STS, SSM } from "aws-sdk";
import fs = require("fs");
import { IAM } from "../src/IAM";
import { writeTo, credentials, credentialsForRole } from "./utils";
import uuid from "uuid/v4";

const approvalTest = async () => {
  try {
    // Uncomment to run the desired approval tests to generate test data.
    // s3Tests( credentials() )
    // stsTests( )
    // stsTests( {externalId: 'Testing'})
    await ssmParameterTests();
  } catch (err) {
    console.log("Test data generation failed: " + err);
  }
};

const roleNameWithoutAccess = "beady-eyeDeniedRole";

const ssmParameterTests = async () => {
  const ssm = new SSM();
  ssm
    .getParameter({ Name: "non-existant-parameter" })
    .promise()
    .catch(writeTo("getParameter-notExists.json"));
  const Name = uuid();
  await ssm
    .putParameter({ Name, Value: "sampleValue", Type: "String" })
    .promise()
    .then(() => {
      return ssm
        .getParameter({ Name })
        .promise()
        .then(writeTo("get-Parameter-Exists.json"));
    })
    .then(() => {
      return ssm.deleteParameter({ Name }).promise();
    });
};

const s3Tests = (credentials) => {
  const s3 = new S3({ credentials: credentials });

  const existingBucketName = "s3001remediate";
  const nonExistingBucketName = "thisBucketShouldNotExist";

  s3.headBucket({ Bucket: existingBucketName })
    .promise()
    .then(writeTo("headBucket-exists.json"));
  s3.headBucket({ Bucket: nonExistingBucketName })
    .promise()
    .catch(writeTo("headBucket-notExists.json"));

  s3.getBucketEncryption({ Bucket: "s3-021-compliant" })
    .promise()
    .then(writeTo("getBucketEncryption-encrypted.json"));
  s3.getBucketEncryption({ Bucket: nonExistingBucketName })
    .promise()
    .catch(writeTo("getBucketEncryption-notExist.json"));

  s3.listObjects({ Bucket: existingBucketName })
    .promise()
    .then(writeTo("listObjects-granted.json"))
    .catch(console.log);
  s3.listObjects({ Bucket: existingBucketName })
    .promise()
    .catch(writeTo("listObjects-denied.json"));
  s3.listObjects({ Bucket: nonExistingBucketName })
    .promise()
    .catch(writeTo("listObjects-notExist.json"));

  // uncomment desired version (manual setup required)
  // s3.getBucketLogging({ Bucket: existingBucketName }).promise().then(writeTo('getBucketLogging-enabled.json'))
  // s3.getBucketLogging({ Bucket: existingBucketName }).promise().then(writeTo('getBucketLogging-disabled.json'))
  s3.getBucketLogging({ Bucket: nonExistingBucketName })
    .promise()
    .catch(writeTo("getBucketLogging-notExist.json"));

  // uncomment desired version (manual setup required)
  // s3.getBucketVersioning({ Bucket: existingBucketName }).promise().then(writeTo('getBucketVersioning-enabled.json'))
  // s3.getBucketVersioning({ Bucket: existingBucketName }).promise().then(writeTo('getBucketVersioning-disabled.json'))
  s3.getBucketVersioning({ Bucket: nonExistingBucketName })
    .promise()
    .catch(writeTo("getBucketVersioning-notExist.json"));

  // uncomment desired version (manual setup required)
  // s3.getBucketAcl({ Bucket: existingBucketName }).promise().then(writeTo('getBucketAcl-publicReadAllUsers.json'))
  // s3.getBucketAcl({ Bucket: existingBucketName }).promise().then(writeTo('getBucketAcl-private.json'))
  s3.getBucketAcl({ Bucket: nonExistingBucketName })
    .promise()
    .catch(writeTo("getBucketAcl-notExist.json"));

  // uncomment desired version (manual setup required)
  // s3.getBucketPolicy({ Bucket: existingBucketName }).promise().then(writeTo('getBucketPolicy-denyAnonymous.json'))
  // s3.getBucketPolicy({ Bucket: existingBucketName }).promise().then(writeTo('getBucketPolicy-public.json'))
  s3.getBucketPolicy({ Bucket: existingBucketName })
    .promise()
    .catch(writeTo("getBucketPolicy-none.json"));
  s3.getBucketPolicy({ Bucket: nonExistingBucketName })
    .promise()
    .catch(writeTo("getBucketPolicy-notExist.json"));

  const existingFile = "test/existingFile";
  const nonExistingFile = "test/nonExistingFile";

  s3.putObject({
    Bucket: existingBucketName,
    Body: "sample",
    Key: existingFile,
  })
    .promise()
    .then(writeTo("putObject-granted.json"))
    .catch(writeTo("putObject-denied.json"));
  s3.putObject({
    Bucket: nonExistingBucketName,
    Body: "sample",
    Key: existingFile,
  })
    .promise()
    .catch(writeTo("putObject-notExist.json"));

  s3.getObject({ Bucket: existingBucketName, Key: existingFile })
    .promise()
    .then(writeTo("getObject-granted.json"))
    .catch(writeTo("getObject-denied.json"));
  s3.getObject({ Bucket: existingBucketName, Key: nonExistingFile })
    .promise()
    .then(writeTo("getObject-noSuchKey.json"))
    .catch(writeTo("getObject-errorNoSuchKey.json"));
  s3.getObject({ Bucket: nonExistingBucketName, Key: existingFile })
    .promise()
    .catch(writeTo("getObject-notExist.json"));

  s3.deleteObject({ Bucket: existingBucketName, Key: existingFile })
    .promise()
    .then(writeTo("deleteObject-granted.json"))
    .catch(writeTo("deleteObject-denied.json"));
  s3.deleteObject({ Bucket: existingBucketName, Key: nonExistingFile })
    .promise()
    .then(writeTo("deleteObject-noSuchKey.json"))
    .catch(writeTo("deleteObject-errorNoSuchKey.json"));
  s3.deleteObject({ Bucket: nonExistingBucketName, Key: existingFile })
    .promise()
    .catch(writeTo("deleteObject-notExist.json"));
};

const stsTests = async (externalId?) => {
  try {
    const creds = await credentials(externalId);
    fs.writeFileSync(
      "test-data/assumeRole-granted.json",
      JSON.stringify(creds)
    );
  } catch (e) {
    fs.writeFileSync("test-data/assumeRole-denied.json", JSON.stringify(e));
  }
};

approvalTest();
