# TrustShare AWS deployment

This directory deploys the Group D TrustShare Docker image to AWS without
changing or replacing the Render deployment in PR #68.

## Architecture

- **API Gateway HTTP API** provides the public HTTPS URL and proxies every path
  to the application without caching authenticated responses.
- **Application Load Balancer** accepts only requests containing a secret
  API Gateway origin header. Direct requests receive HTTP 403.
- **ECS Fargate** runs one small Docker task. Its security group accepts port
  8000 only from the load balancer.
- **Encrypted EFS** persists uploaded ciphertext and per-file wrapped keys when
  an ECS task restarts.
- **RDS PostgreSQL** runs in private subnets and accepts port 5432 only from the
  ECS task security group.
- **ECR** stores the production Docker image.
- **Secrets Manager** generates the database password, JWT secret, and separate
  file-encryption master key.
- **GitHub Actions OIDC** supplies short-lived AWS credentials. No AWS access
  key is stored in GitHub or committed to the repository.

Fargate uses public subnets only for outbound access to ECR, CloudWatch, and
optional SMTP/OAuth providers. The task receives a public IP, but its security
group has no public inbound rule. The database has no public IP.

## Important cost boundary

This architecture uses AWS services that can consume Free Tier credits,
including Fargate, an Application Load Balancer, RDS, EFS, public IPv4,
API Gateway, Secrets Manager, and CloudWatch. Use an AWS **Free Plan** account or
approved internship credits. Do not deploy it in a paid account without first
creating a budget and billing alerts.

The deployment is for demonstration data. Do not upload real confidential,
financial, medical, or identity documents.

## First deployment

### 1. Create the infrastructure stack

Sign in to AWS and open **CloudFormation > Create stack > With new resources**.

1. Select **Upload a template file** and upload `aws/infrastructure.yml`.
2. Use stack name `trustshare-group-d-aws`.
3. Keep region `ap-south-1` (Mumbai).
4. Keep `DesiredCount` set to `0` for the first creation.
5. Generate at least 32 random alphanumeric characters for
   `OriginVerifyHeaderValue`. Do not place this value in GitHub.
6. Leave `CreateGitHubOidcProvider` as `true` unless the AWS account already has
   `token.actions.githubusercontent.com` configured as an IAM identity provider.
7. Acknowledge that CloudFormation creates named IAM roles and create the stack.

The first stack can take approximately 15-25 minutes because RDS and the load
balancer must be provisioned. `DesiredCount=0` is intentional because ECR does not contain
the application image yet.

### 2. Connect GitHub Actions without access keys

After the stack reaches `CREATE_COMPLETE`:

1. Open the stack **Outputs** tab.
2. Copy `GitHubActionsRoleArn`.
3. In the GitHub repository, open **Settings > Secrets and variables > Actions >
   Variables**.
4. Create repository variable `AWS_ROLE_ARN` with the copied role ARN.

This is a role identifier, not an AWS password or access key.

### 3. Build and deploy

The first push of `Group-D-feature/AWS-Deployment-Abhishek` starts the deployment
automatically. This must happen only after the CloudFormation stack and
`AWS_ROLE_ARN` repository variable are ready. After this workflow is present on
the repository's default branch, it can also be started manually from GitHub
Actions with **Run workflow**.

The workflow obtains temporary AWS credentials, builds the existing Dockerfile,
pushes commit-specific and `latest` images to ECR, starts one ECS task, waits for
it to stabilize, and calls `/health` through the API Gateway HTTPS URL.

The live application, health endpoint, and API-documentation URL are written to
the workflow summary and are also available in CloudFormation Outputs.

## Updating the deployment

Application-only updates require rerunning **Deploy Group D to AWS**. For
infrastructure updates, update the CloudFormation stack with
`aws/infrastructure.yml`, set `DesiredCount` to `1`, and retain the existing
parameters unless the change requires otherwise.

## Verification checklist

1. `ApplicationUrl` opens the TrustShare login page over HTTPS.
2. `HealthUrl` returns `{"status":"ok",...}`.
3. `ApiDocumentationUrl` opens the FastAPI documentation.
4. Signup, login, token refresh, and logout work.
5. Upload, download, sharing, and Shared With Me work.
6. An encrypted file still downloads after forcing a new ECS deployment.
7. The load balancer's direct DNS name returns HTTP 403.
8. RDS is marked **Not publicly accessible**.

API Gateway HTTP APIs accept payloads up to 10 MB. Keep demonstration uploads
below that limit even though the application itself can validate larger files.

## Optional integrations

SMTP, Google OAuth, and Microsoft OAuth are not enabled by this stack. If the
demo requires them, store their credentials in Secrets Manager and extend the
ECS task definition to inject them. Never commit those credentials.

## Cleanup

Deleting the CloudFormation stack removes the infrastructure, database,
encrypted uploaded files, generated secrets, logs, and ECR images. This is
destructive and permanently deletes demonstration data. Verify the stack name
and export any required evidence before deletion.
