# terraform/backend.tf

terraform {
  backend "s3" {
    bucket         = "fcapellatw-notification-service-tfstate"
    key            = "global/terraform.tfstate"
    region         = "us-east-1"

    # O nome da tabela DynamoDB para o lock
    dynamodb_table = "terraform-state-locks"
    encrypt        = true
  }
}