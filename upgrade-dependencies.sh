#!/bin/bash

# Upgrade packages
yarn run dependency:upgrade

# Check nothing is broken
yarn run test
yarn run test:security

# Commit changes
git add package.json yarn.lock
git commit -m "[CI] - auto-upgrade dependencies"
git push

# TODO - submit pull request
