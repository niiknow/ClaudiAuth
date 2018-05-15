#!/bin/bash
#
# Creates a new user pool and client with minimal policies and attributes
# (ie, use for authentication only, no authorization or profile tracking).
#
#   cognite-init-userpool.sh
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
appName=`node -p "require('./config.json').appName"`
appNameLowerCase=$(echo "$appName" | tr '[:upper:]' '[:lower:]')
adminEmail=`node -p "require('./config.json').adminEmail"`
clientDef=`node -p "JSON.stringify(require('./config.json').clientDef)"`
poolDef=`node -p "JSON.stringify(require('./config.json').poolDef)"`
bucketName=cdb-$appNameLowerCase

# Getting the account number for later user
awsAccountNumber=$(aws sts get-caller-identity --output text --query 'Account')

echo Creating Cognito User pool

aws cognito-idp create-user-pool \
    --pool-name ${appName}UserPool \
    --region $region \
    --cli-input-json ${poolDef} > /tmp/${appName}-create-user-pool
userPoolId=$(grep -E '"Id":' /tmp/${appName}-create-user-pool | awk -F'"' '{print $4}')
userPoolArn="arn:aws:cognito-idp:$region:$awsAccountNumber:userpool/$userPoolId"

aws cognito-idp create-user-pool-client \
    --user-pool-id $userPoolId \
    --client-name ${appName} \
    --region $region \
    --cli-input-json ${clientDef} > /tmp/${appName}-create-user-pool-client
userPoolClientId=$(grep -E '"ClientId":' /tmp/${appName}-create-user-pool-client | awk -F'"' '{print $4}')

echo "Created: $userPoolArn $userPoolClientId"

# creating app storage, don't care if failure or already exists
aws s3 mb s3://$bucketName/ --region $region || true

# write config
( cat <<EOF
{
    "env": "$env",
    "region": "$region",
    "userPoolId": "$userPoolId",
    "userPoolClientId": "$userPoolClientId",
    "bucketName": "$bucketName",
    "accountNumber": "$awsAccountNumber",
    "logLevel": "none"
}
EOF
) > ../.env.$env.json

# write default policy for all lambda functions
( cat <<EOF
{
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "s3:ListAllMyBuckets",
            "Resource": "arn:aws:s3:::*"
        },
        {
            "Effect": "Allow",
            "Action": "s3:*",
            "Resource": [
                "arn:aws:s3:::$bucketName",
                "arn:aws:s3:::$bucketName/*"
            ]
        }
    ]
}
EOF
) > ./default_policies/claudiauthdb.json

( cat <<EOF
{
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "cognito-idp:ListUsers"
            ],
            "Resource": "$userPoolArn"
        },
        {
            "Effect": "Allow",
            "Action": [
                "cognito-idp:*"
            ],
            "Resource": "$userPoolArn"
        }
    ]
}
EOF
) > ./default_policies/cognito-idp.json

exit 0
