import * as fs from 'fs';
import { format } from 'date-fns';
import { S3 } from 'aws-sdk'
import { JasmineComplianceRunner } from './JasmineComplianceRunner';
import { lambdaNotificationReporter } from './lambdaNotificationReporter';
import { JUnitXmlReporter } from 'jasmine-reporters';
import { join } from 'path'

export class LambdaTestRunner {
    private runner: JasmineComplianceRunner;
    private reportLocation;

    constructor(tempReportLocation: string = '/tmp') {
        this.reportLocation = join(tempReportLocation,'junitresults.xml');
        let junitReporter = new JUnitXmlReporter({
            savePath: tempReportLocation,
            consolidateAll: true
        });
        this.runner = new JasmineComplianceRunner(junitReporter, lambdaNotificationReporter());
    }

    async execute() {
        return (await this.runner.execute());
    }

    async uploadJUnitReportToS3(s3ObjectPrefix: string, s3BucketName: string) {
        const reportContents = fs.readFileSync(this.reportLocation, 'utf8');
        const now = format(new Date(), 'YYYY-MM-DD-HH-mm-ss');
        const fileName = `${s3ObjectPrefix}-${now}.xml`;

        const params = {
            Body: reportContents,
            Bucket: s3BucketName,
            Key: fileName
        };
        let s3 = new S3();
        return (s3.putObject(params).promise());
    }
}
