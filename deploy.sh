#!/bin/bash
# build and deploy from google app engine console

echo "Building and deploying..."
git reset --hard HEAD
yarn install
yarn build
rm -rf node_modules/ package.json README.md src/ webpack.config.js yarn.lock
gcloud app deploy