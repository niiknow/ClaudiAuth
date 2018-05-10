
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

echo -n "Enter email and press [ENTER]: "
read USERNAME
echo -n "Enter password (Alphanumeric, 1 capital, 1 special = 8 chars) and press [ENTER]: "
read PASSWORD

aws cognito-idp admin-create-user --region $region --cli-input-json '
{
  "UserPoolId": "$userPoolId",
  "Username": "$USERNAME",
  "UserAttributes": [
    {
        "Name": "email",
        "Value": "$USERNAME"
    },
    {
        "Name": "custom:teams",
        "Value": "x,y,z"
    }
  ],
  "TemporaryPassword": "$PASSWORD",
  "ForceAliasCreation": true
}'
