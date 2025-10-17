terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

variable "source_email" {
  description = "The email address verified in AWS SES to be used as the source."
  type        = string
}

resource "aws_iam_role" "lambda_exec_role" {
  name = "notification-service-lambda-role"

  assume_role_policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [{
      Action    = "sts:AssumeRole",
      Effect    = "Allow",
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "ses_send_email" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSESFullAccess"
}

data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "../dist"
  output_path = "../dist.zip"
}

resource "aws_lambda_function" "notification_lambda" {
  function_name = "notification-service-lambda"
  handler       = "infrastructure/http/handler.handler"
  runtime       = "nodejs22.x"

  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  role = aws_iam_role.lambda_exec_role.arn

  environment {
    variables = {
      SOURCE_EMAIL = var.source_email
    }
  }
}

resource "aws_apigatewayv2_api" "http_api" {
  name          = "notification-service-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "default_stage" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id           = aws_apigatewayv2_api.http_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.notification_lambda.invoke_arn
}

resource "aws_apigatewayv2_route" "notification_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /notifications"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_lambda_permission" "api_gw_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.notification_lambda.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}

output "api_endpoint" {
  description = "The public URL of the API Gateway."
  value       = aws_apigatewayv2_api.http_api.api_endpoint
}