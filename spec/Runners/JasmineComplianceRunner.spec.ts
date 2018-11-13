import { JasmineComplianceRunner } from "../../src";
import { jasmine } from "jasmine";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
describe('Given the Jasmine Compliance Runner ', ()=> {
    it('it should execute the test suite successfully', async(done) => {
        const envStage = 'np'
        var cb = () => { };
        const complianceRunner = new JasmineComplianceRunner(cb,'myproduct','mybucket', true);
        let complianceParams = {};
        require('./sampleTestSuite').suite(complianceParams);
        complianceRunner.execute();
        await sleep(4000);
        done();
    })

})
