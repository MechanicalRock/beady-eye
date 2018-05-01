#Beady Eye

[Behaviour Driven Infrastructure](https://mechanicalrock.github.io/bdd/devops/2016/12/21/introducing-infrastructure-mapping.html) is the technique of describing the expected behaviour of infrastructure components to support the specification and test driven development of Infrastructure as Code.

Beady Eye is a testing framework to support Behaviour Driven Infrastructure on AWS components, to keep an eye on your infrastructure compliance!

# Development

```
git clone https://github.com/MechanicalRock/beady-eye
cd beedy-eye
yarn install
yarn link
cd /path/to/my/project
yarn link beady-eye
```

## Generating test data
Set the details of the account you wish to switch to for test data generation
```
export AWS_PROFILE='my_profile'
export AWS_ACCOUNT_ID='123456
```

```
yarn run test:approval
```

# Releasing
```
yarn run release
git push
git push --tags
```