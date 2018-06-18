import { VPC } from '../../src/VPC'

describe ("VPC Module", () => {

    describe ("#VPCObject", () => {
        const testVPCName = "testVPC";
        let vpc
        
        beforeEach(()=> {
            vpc = new VPC(testVPCName);

        })

        it("exists", () => expect(vpc).toBeDefined() )

        it("has a name function which prints a name", () => {
            expect(vpc.toString).toBeDefined();
            expect(vpc.toString()).toEqual("VPC: testVPC");
        })
    })
})
