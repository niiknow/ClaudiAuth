
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

echo -n "Enter username [ENTER]: "
read USERNAME
echo -n "Enter email [ENTER]: "
read EMAIL
echo -n "Enter password (Alphanumeric, 1 capital, 1 special = 8 total chars) and press [ENTER]: "
read PASSWORD

( cat <<EOF
{
  "UserPoolId": "$userPoolId",
  "Username": "$USERNAME",
  "MessageAction": "SUPPRESS",
  "ForceAliasCreation": false,
  "UserAttributes": [
    {
        "Name": "preferred_username",
        "Value": "$USERNAME"
    },
    {
        "Name": "email",
        "Value": "$EMAIL"
    },
    {
        "Name": "custom:teams",
        "Value": "x,y,z"
    },
    {
        "Name": "custom:uid",
        "Value": "$USERNAME"
    },
    {
        "Name": "custom:rank",
        "Value": "adm"
    }
  ],
  "TemporaryPassword": "$PASSWORD"
}
EOF
) > .env.$env.json

inputJson=`node -p "JSON.stringify(require('./.env.$env.json'))"`
aws cognito-idp admin-create-user --region $region --cli-input-json ${inputJson}

echo 'created'

aws cognito-idp initiate-auth --region $region --client-id "$userPoolClientId" --auth-flow "USER_PASSWORD_AUTH" --auth-parameters USERNAME="$USERNAME",PASSWORD="$PASSWORD" > .env.$env.json

echo 'challenge'

inputSession=`node -p "require('./.env.$env.json').Session"`
aws cognito-idp respond-to-auth-challenge --session ${inputSession} --region $region --client-id "$userPoolClientId" --challenge-name "NEW_PASSWORD_REQUIRED" --challenge-responses USERNAME="$USERNAME",NEW_PASSWORD="$PASSWORD"

echo 'auth'
