
import { Credentials, Route53 as AwsRoute53 } from 'aws-sdk'
import { IamRole } from './IAM'
import { expect } from 'chai'
import { isMatch } from 'lodash'

export class Route53 {
    lazyRoute53Client: AwsRoute53

    constructor(private role?: IamRole) {
    }

    async route53Client() {

        let options: AwsRoute53.Types.ClientConfiguration;

        if (!this.lazyRoute53Client) {
            options = {
                credentials: this.role ? await this.role.credentials() : undefined
            }

            this.lazyRoute53Client = new AwsRoute53(options);
        }

        return this.lazyRoute53Client
    }

    toString() {
        return `Route53`
    }

    async hostedZoneShouldExist(DNSName: string) {
        let route53 = await this.route53Client();
        let response = await route53.listHostedZonesByName({ DNSName });

        expect(response).not.to.be.undefined;

        return true
    }

}

// const route53Bucket = (name: string, role?: IamRole) => {

//     return new Route53Bucket(name, role)
// }

// export const Route53 = {
//     bucket: route53Bucket
// }
// export default Route53