import { Redshift as AwsRedshift } from 'aws-sdk'
import { expect } from 'chai'
import { region } from 'aws-sdk/clients/health';

export class RedshiftCluster {
    clusterName: string
    redshiftClient: AwsRedshift

    constructor(clusterName: string, region?: string) {
        this.clusterName = clusterName
        this.redshiftClient = new AwsRedshift({ region: region })
    }
    
    async shouldExist() {
        try {

            await this.redshiftClient.describeClusters({
                ClusterIdentifier: this.clusterName
            }).promise()

            return true
        } catch (err) {

            if(err.code === 'ClusterNotFound'){
                return false
            }
            throw err
        }
    }

    async allowsConnectionFrom(cidrRance) {
        return false
    }

    toString() {
        return `RedshiftCluster(${this.clusterName})`
    }

}