# 🚀 Serverless Notification Service - A Clean Architecture Blueprint

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![AWS Lambda](https://img.shields.io/badge/AWS_Lambda-FF9900?style=for-the-badge&logo=aws-lambda&logoColor=white)](https://aws.amazon.com/lambda/)
[![Terraform](https://img.shields.io/badge/Terraform-7B42BC?style=for-the-badge&logo=terraform&logoColor=white)](https://www.terraform.io/)
[![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)

Welcome! This project is more than just a notification service; it's a **working blueprint** for building robust, scalable, and maintainable serverless applications on AWS.

It was crafted as a learning and mentorship journey, focusing on professional software engineering principles from the ground up.

### 🎯 Project Philosophy

Our goal was to demonstrate how modern software principles can be applied in a serverless context.

* 🏛️ **Clean Architecture:** We use the **Hexagonal (Ports & Adapters)** pattern to completely decouple our core business logic from external infrastructure like AWS services. Our `domain` and `application` layers have zero knowledge of how an email is sent or how a request is received.
* 🧪 **Test-Driven Development (TDD):** The entire core logic was built following a strict Red-Green-Refactor cycle. We have 100% test coverage on our business rules, providing maximum confidence. Infrastructure adapters are covered by integration tests.
* 🏗️ **Infrastructure as Code (IaC):** All AWS resources are managed declaratively using **Terraform**. This ensures our infrastructure is version-controlled, repeatable, and easy to manage.
* 🔐 **Secure & Robust:** We handle configuration and secrets responsibly, using `.env` files for local development and schema validation with **Zod** to create a bulletproof API entry point.

## 🛠️ Getting Started

Follow these steps to get the service running in your own AWS account.

### Prerequisites

Make sure you have the following tools installed:
* [NVM](https://github.com/nvm-sh/nvm) (to manage Node.js versions)
* [AWS CLI](https://aws.amazon.com/cli/)
* [Terraform](https://developer.hashicorp.com/terraform/downloads)
* An AWS Account

### ⚙️ Step-by-Step Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/fcappellaTW/notification-service.git
    cd notification-service
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Local Environment**
    This project uses an `.env` file to manage your AWS profile.

    ```bash
    # 1. Copy the example file
    cp .env.example .env

    # 2. Configure an AWS profile with your credentials. This command will ask for your keys.
    #    We recommend using a profile name like 'notification-service'.
    aws configure --profile notification-service

    # 3. Make sure the AWS_PROFILE in your .env file matches the profile you just configured.
    ```

4.  **Configure Infrastructure Variables**
    Terraform needs to know which email address to use as the sender.

    ```bash
    # 1. Navigate to the terraform directory
    cd terraform

    # 2. Copy the example variables file
    cp terraform.tfvars.example terraform.tfvars

    # 3. Edit terraform.tfvars and set the value for `source_email`.
    ```

5.  **Verify Identities in AWS SES 📧**
    Our service uses AWS SES, which starts in **Sandbox mode** for security. This means you can only send emails **TO** and **FROM** addresses that you have verified.

    * Go to the **Simple Email Service (SES)** console in your AWS account (in the same region as your Terraform provider, e.g., `us-east-1`).
    * Navigate to **Configuration -> Identities**.
    * Create and verify the **sender email** (the one you put in `terraform.tfvars`).
    * Create and verify the **recipient email** you'll use for testing.

### 💻 Development Workflow

* **Run all tests:**
    ```bash
    npm test
    ```
* **Check test coverage:**
    ```bash
    npm test -- --coverage
    ```
* **Package the application for deployment:**
    This command compiles the TypeScript, installs production dependencies, and creates the `dist.zip` file needed by Terraform.
    ```bash
    npm run package
    ```

### 🚀 Deployment

With everything configured, deploying is a 3-step process. Make sure you are inside the `terraform/` directory.

1.  **Load Environment Variables**
    From the project root, run:
    ```bash
    source .env
    # Then navigate back to the terraform directory
    cd terraform
    ```

2.  **Initialize Terraform**
    This downloads the necessary AWS provider. You only need to do this once.
    ```bash
    terraform init
    ```

3.  **Plan the Deployment**
    This shows you what Terraform is about to create. It's a safe dry-run.
    ```bash
    terraform plan
    ```

4.  **Apply the Deployment**
    This will create the resources in your AWS account.
    ```bash
    terraform apply
    ```
    After it finishes, it will output the `api_endpoint` URL.

### ✅ Post-Deployment Testing

Use the provided example script to test your live endpoint.

1.  **Copy the script** (from the project root):
    ```bash
    cp test.sh.example test.sh
    ```
2.  **Edit `test.sh`** and paste the `api_endpoint` URL from the Terraform output.
3.  **Make it executable:**
    ```bash
    chmod +x test.sh
    ```
4.  **Run it!**
    ```bash
    ./test.sh
    ```
    You should see a success message and receive an email at your verified recipient address! 🎉

### 🗺️ Architectural Roadmap & Future Vision

With the foundational CI/CD pipeline, remote state management, and build optimizations in place, this project serves as a robust and stable blueprint for serverless applications.

The next planned architectural evolution is to enhance the system's resilience and scalability, transforming it into a truly event-driven service.

* **Evolve to an Asynchronous, Event-Driven Architecture**
    * **The Vision:** Introduce an **Amazon SQS queue** to decouple the initial API request from the actual notification sending process. The API Lambda's only job would be to validate and enqueue the request, providing an instant response to the client. A separate processor Lambda would then consume messages from this queue asynchronously.
    * **Key Benefits:**
        * **✨ Instant API Responses:** Clients no longer wait for the email to be sent.
        * **🛡️ Greater Resilience & Reliability:** Protects against failures and downtime of the email service (SES). With retries and a Dead-Letter Queue (DLQ), no notification is ever lost.
        * **🌊 Massive Scalability:** The system can gracefully handle huge traffic spikes by buffering requests in the queue.