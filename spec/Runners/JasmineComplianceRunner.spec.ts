import { jasmine } from "jasmine";
import * as AWSMock from 'aws-sdk-mock'
import { LambdaTestRunner } from "../../src/runners/LambdaTestRunner";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Given a sample test', () => {
    afterEach(() => {
        AWSMock.restore('S3');
    });

    it('Jasmin compliance runner should execute it successfully', async (done) => {
        AWSMock.mock("S3", "putObject", (params, callback) => {
            callback(null, "");
        });
        const envStage = 'np'
        var cb = () => { };
        const localExecutionFlag = true;
        const complianceRunner = new LambdaTestRunner(localExecutionFlag);
        let complianceParams = {};
        require('./sampleTestSuite').suite({});
        await complianceRunner.execute();
        await complianceRunner.uploadJUnitReportToS3('MyProduct', 'MyBucket');
        //sleep(4000);
        done();
    })
    it('Jasmin compliance runner should throw an error when it can not upload the report to S3', async (done) => {
        AWSMock.mock("S3", "putObject", (params, callback) => {
            callback(new Error('unable to upload to S3'), "");
        });

        const envStage = 'np'
        var cb = () => { };
        const localExecutionFlag = true;
        try {
            const complianceRunner = new LambdaTestRunner(localExecutionFlag);
            require('./sampleTestSuite').suite({});
            await complianceRunner.execute();
            await complianceRunner.uploadJUnitReportToS3('MyProduct', 'MyBucket');
        } catch (error) {
            done();
            return;
        }
        done.fail('exception not thrown');
    })


})
