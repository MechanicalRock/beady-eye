import { CloudFront, STS, config } from 'aws-sdk'
import fs = require('fs')
import { writeTo, credentials, credentialsForRole } from '../../test-data/utils'
import * as proxy from 'proxy-agent';
import { doesNotThrow } from 'assert';


describe("CloudFront#Generate test data" , () => {
    it('dummy test ', (done) => {
        done();
    });
    // uncomment these lines for generating test data for cloudfront tests.
    // it('it should generate test data for known distribution', async (done ) => {
    //     try {  
            
    //         let result = await cloudFrontTestDataGenerator('E1GT294N66J0WF'); 
    //         writeTo('getDistribution-exists.json')(result);       
    //         done();
    //     } catch (err) {
    //         console.log("Test data generation failed for known distribution id: " , err)
    //         done.fail('failed to generate test data');
    //     }
    // } );
    // it('it should generate test data for nonexistant distribution ', async (done ) => {
    //     try {  
    //         const nonExistantDistribution = 'thisCFShouldNotExist';
    //         let result = await cloudFrontTestDataGenerator(nonExistantDistribution);        
    //         done.fail(`${nonExistantDistribution} should not exist`);
    //     } catch (err) {
    //         writeTo('getDistribution-NotExists.json')(err);       
    //         done();
    //     }
    // } );
    
} )

const cloudFrontTestDataGenerator = async (cloudFrontId: string) => {
    const httpProxy = process.env['HTTP_PROXY'];
    if(httpProxy){
        config.update({
            httpOptions: { agent: proxy(httpProxy) }
        });
    }
    
    let cloudFront = new CloudFront({ region: 'ap-southeast-2'  });
    let result = await cloudFront.getDistribution({ Id : cloudFrontId }).promise();
    return(result);
}



