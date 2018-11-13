import { Callback } from 'aws-lambda';
import { Credentials, S3 } from 'aws-sdk'
import * as fs from 'fs';
import * as moment from 'moment';

export const S3JUnitReporter = (callback: Callback, s3BucketName:string, filePath: string, productName?:string) => {
    return {
      jasmineDone: async (result, done) => {
        const reportContents = fs.readFileSync(filePath, 'utf8');
        if(!productName) {
          productName = 'complianceReport';
        }
        const now = moment().format('YYYY-MM-DD-HH-mm-ss');
        const fileName = productName+'-'+ now + '.xml';
        try {
          const params = {
            Body: reportContents,
            Bucket: s3BucketName,
            Key: fileName
          };
          let s3 = new S3();
          await s3.putObject(params).promise();
        } catch (error) {
          console.log("Error in uploading the report to S3", error);
        }
        done();
      },

      

    }
  }
 
 


