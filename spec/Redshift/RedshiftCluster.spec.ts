import {RedshiftCluster} from "../../src/Redshift"
import AWSMock = require('aws-sdk-mock')

describe ("RedshiftCluster module", () => {
    let clusterName = "my-redshift-cluster"
    let redshift = new RedshiftCluster(clusterName)
    describe("#toString()", ()=> {
        it('should be defined', () => {
            expect(redshift.toString).toBeDefined()
        })
        it('should return the form RedshiftCluster(clusterName)', ()=> {
            expect(redshift.toString()).toBe('RedshiftCluster(my-redshift-cluster)')
        })
    })

})