# Beady Eye [![Known Vulnerabilities](https://snyk.io/test/github/MechanicalRock/beady-eye/badge.svg)](https://snyk.io/test/github/MechanicalRock/beady-eye) 

[Behaviour Driven Infrastructure](https://mechanicalrock.github.io/bdd/devops/2016/12/21/introducing-infrastructure-mapping.html) is the technique of describing the expected behaviour of infrastructure components to support the specification and test driven development of Infrastructure as Code.

Beady Eye is a testing framework to support Behaviour Driven Infrastructure on AWS components, to keep an eye on your infrastructure compliance!

# Getting Started

Create your compliance test my-compliance-test.js:
NOTE: compliance tests need to be `.js`
```
module.exports.suite = (params) => {
    describe("My Redshift Cluster", () => {
        let redshiftClusterName = 'my-redshift-cluster'

        beforeAll((done)=> {
        
            const bdi = require('beady-eye')
            const RedshiftCluster = bdi.RedshiftCluster
            
            this.redshift = new RedshiftCluster(redshiftClusterName, region)
            done()
        })

        it("should exist", async (done) => {
            expect(this.redshift).toBeDefined()
            expect(await this.redshift.shouldExist()).toEqual(true)
            done()
        })
    })
}
```

Configure your src/complianceTestLambda.ts:
```
export const runCompliance: Handler = (event: APIGatewayEvent, context: Context, cb: Callback) => {

  let complianceRunner = new JasmineComplianceRunner(cb)  

  require('./my-compliance-test.js').suite(redshiftParams)

  complianceRunner.execute()
}
```

Configure serverless.yaml:
```
functions:
  compliance:
    handler: src/complianceTests.runCompliance
    package:
      include:
        - src/*.js
        - node_modules/beady-eye/**
```

# Development

```
git clone https://github.com/MechanicalRock/beady-eye
cd beedy-eye
npm install
npm link
cd /path/to/my/project
npm link beady-eye
```

## Continuous Build
In order to build changes continuously, when working with linked projects, create a separate terminal and run:

`npm run build:watch`

This will automatically re-build upon changes to your beady-eye source, so it is available in your linked project.

## Generating test data
Set the details of the account you wish to switch to for test data generation
```
export AWS_PROFILE='my_profile'
export AWS_ACCOUNT_ID='123456
```

```
npm run test:approval
```

# Releasing

Releasing is automated using [semantic-release](https://github.com/semantic-release/semantic-release) upon commit to master

In order to create a new release:
* Merge PRs using squash + merge (preferred)
* Ensure the merge commit includes an appropriate commit message:

Here is an example of the release type that will be done based on a commit messages:

| Commit message                                                                                                                                                                                   | Release type               |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------|
| `fix(pencil): stop graphite breaking when too much pressure applied`                                                                                                                             | Patch Release              |
| `feat(pencil): add 'graphiteWidth' option`                                                                                                                                                       | (Minor) Feature Release  |
| `perf(pencil): remove graphiteWidth option`<br><br>`BREAKING CHANGE: The graphiteWidth option has been removed.`<br>`The default graphite width of 10mm is always used for performance reasons.` | (Major) Breaking Release |
