#!/bin/bash
#
# Creates a new user pool and client with minimal policies and attributes
# (ie, use for authentication only, no authorization or profile tracking).
#
#   cognite-create-userpool.sh
#
#

# Check if the AWS CLI is in the PATH
found=$(which aws)
if [ -z "$found" ]; then
  echo "Please install the AWS CLI under your PATH: http://aws.amazon.com/cli/"
  exit 1
fi

# Check if jq is in the PATH
found=$(which node)
if [ -z "$found" ]; then
  echo "Please install nodejs under your PATH: https://nodejs.org/en/"
  exit 1
fi

if [ ! -f config.json ]; then
  echo "config.json not found!"
  exit 1
fi

# Read other configuration from config.json
cliProfile=`node -p "require('./config.json').cliProfile"`
if [[ $? == 0 ]]; then
  echo "Setting session CLI profile to $cliProfile"
  export AWS_DEFAULT_PROFILE=$cliProfile
fi
env=`node -p "require('./config.json').env"`
region=`node -p "require('./config.json').region"`
userPoolId=`node -p "require('../.env.$env.json').userPoolId"`
userPoolClientId=`node -p "require('../.env.$env.json').userPoolClientId"`
bucketName=`node -p "require('../.env.$env.json').bucketName"`

# Getting the account number for later user
awsAccountNumber=$(aws sts get-caller-identity --output text --query 'Account')

echo Deleting Cognito User pool

aws cognito-idp delete-user-pool-client --user-pool-id $userPoolId --client-id $userPoolClientId --region $region
aws cognito-idp delete-user-pool --user-pool-id $userPoolId --region $region

userPoolArn="arn:aws:cognito-idp:$region:$awsAccountNumber:userpool/$userPoolId"
echo "Deleted: $userPoolArn $userPoolClientId"

# deleting app storage, don't care if failure or already exists
aws s3api delete-bucket --bucket $bucketName --region $region || true

exit 0
