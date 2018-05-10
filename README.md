# ClaudiAuth
 This project start as a mean to gain deeper understanding of AWS Cognito User Pool API/SDK.  It can also be use as a Authentication starter project.

## Tech Stack
* AWS CLI
* NodeJS
* ClaudiaJS
* Cognito User Pool
* AWS Lambda + API Gateway as micro service
* AWS S3 as backend storage

## Goal/Tasks
[x] cognito user pool create and removal script
[x] proxy cognito user pool as generic Auth API
[] proxy cognito user pool as generic Users API
[] create generic SAAS architecture API: teams, projects, and tasks.
[] provide direction for enhancement such as: two-factor auth, having more than 1000 users, having more than 1000 projects/tasks/etc...

# Architecture Design
* A User belongs to many Teams
* A User has a rank to identify the User permission level.  Rank suggestion: admiral/adm, captain/capt, commander/cdr, lieutenant/lt, ensign/ens - ref: https://en.wikipedia.org/wiki/United_States_Navy_officer_rank_insignia

* A Team can have many Users
* A Team can have many Admin Users

* A Project can have many Users or Team
* A Project can have many Admin Users
* A Project can have many Tasks
* A Project can have many child Projects
* A Project belongs to a single parent Project
* A Project can have many [fill_in_the_blank_here]

* A Task belongs to a single Project.
* A Task can have many related Tasks

Task was provided as an example, but you can create additional micro-service APIs here to extend this project for your personal use-case.

## Example Use-Cases:
* Project->Charity - Donation Platform
* Project->Blog - Blogging
* Project->Products - ecommerce
* Project->SubscriberLists - email/texting list
* Project->Pages - cloud CMS

# Stack
* Cognito User Pool - for user authentication and simple api gateway authorization
* Lambda - package using claudiajs

# Resource
https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-attributes.html

# MIT
