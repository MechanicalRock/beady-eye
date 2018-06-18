#Beady Eye

[Behaviour Driven Infrastructure](https://mechanicalrock.github.io/bdd/devops/2016/12/21/introducing-infrastructure-mapping.html) is the technique of describing the expected behaviour of infrastructure components to support the specification and test driven development of Infrastructure as Code.

Beady Eye is a testing framework to support Behaviour Driven Infrastructure on AWS components, to keep an eye on your infrastructure compliance!

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
```
npm run release
git push
git push --tags
```