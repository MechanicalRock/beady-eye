import { RDS } from '../src/RDS'

describe ("RDS Module", () => {

    describe ("#RDSObject", () => {
        const testRDSName = "testRDS";
        const testRDSRegion = "test-region-1"
        let rds
        
        beforeEach(()=> {
            rds = new RDS(testRDSName);

        })

        it("exists", () => expect(rds).toBeDefined() )

        it("has a name function which prints a name", () => {
            expect(rds.toString).toBeDefined();
            expect(rds.toString()).toEqual("RDS: testRDS");
        })
    })
})
