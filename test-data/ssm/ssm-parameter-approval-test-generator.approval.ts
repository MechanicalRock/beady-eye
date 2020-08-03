import { SSM } from "aws-sdk";
import { writeTo, credentials, credentialsForRole } from "../utils";
import { v4 as uuid } from "uuid";

// const ssmParameterTests = async () => {
//   const Name = uuid();
//   await ssm.putParameter({ Name, Value: 'sampleValue', Type: 'String' }).promise().then(() => {
//     return ssm.getParameter({ Name }).promise().then(writeTo('get-Parameter-Exists.json'))
//   }).then(() => {
//     return ssm.deleteParameter({ Name }).promise()
//   })
// }

xdescribe("SSMParameter Approval Tests", () => {
  let ssm;
  beforeAll(() => {
    ssm = new SSM({
      region: "ap-southeast-2",
    });
  });

  it(
    "should generate data for non-existent parameter",
    async () => {
      await ssm
        .getParameter({ Name: "non-existant-parameter" })
        .promise()
        .catch(writeTo("ssm/getParameter-notExists.json"));
    },
    30 * 1000
  );

  describe("existing parameter", () => {
    const Name = uuid();
    beforeAll(async () => {
      await ssm
        .putParameter({ Name, Value: "sampleValue", Type: "String" })
        .promise();
    }, 20 * 1000);

    afterAll(async () => {
      await ssm.deleteParameter({ Name }).promise();
    }, 20 * 1000);

    it(
      "should generate data for an existing parameter",
      async () => {
        await ssm
          .getParameter({ Name })
          .promise()
          .then(writeTo("ssm/get-Parameter-Exists.json"));
      },
      20 * 1000
    );
  });
});

// export const writeTo = (filename) => {
//   return (result) => {
//     fs.writeFileSync(`test-data/${filename}`, JSON.stringify(result, null, 2))
//   }
// }
