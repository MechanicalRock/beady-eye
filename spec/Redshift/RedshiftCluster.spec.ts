import {RedshiftCluster} from "../../src/Redshift"
import * as AWSMock from 'aws-sdk-mock'

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

    describe('#flatten', () => {
        beforeAll(() => {
            this.redshift = new RedshiftCluster(clusterName)
        })
        it('should return [] when flattening []', () => {
            let actual = this.redshift.flatten([])
            expect(actual).toEqual([])
        })

        it('should do nothing on flat arrays', () => {
            let flatArray = [ 1, 2 ]
            expect(this.redshift.flatten(flatArray)).toEqual(flatArray)
        })

    })

})