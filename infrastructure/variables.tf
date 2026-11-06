variable "environment" {
  type        = string
  description = "Environment name"
  default     = "staging"
}

variable "aws_region" {
  type        = string
  description = "AWS region"
  default     = "us-east-1"
}

variable "app_name" {
  type        = string
  description = "Application name"
  default     = "secure-file-exchange"
}

variable "api_image_uri" {
  type        = string
  description = "ECR image URI for API service"
  default     = ""
}

variable "web_image_uri" {
  type        = string
  description = "ECR image URI for Web service"
  default     = ""
}

variable "database_password" {
  type        = string
  description = "RDS database password"
  sensitive   = true
  default     = ""
}

variable "database_username" {
  type        = string
  description = "RDS database username"
  default     = "sfx_app"
}

variable "instance_type_api" {
  type        = string
  description = "ECS task CPU/memory for API"
  default     = "t4g.medium"
}

variable "instance_type_web" {
  type        = string
  description = "ECS task CPU/memory for Web"
  default     = "t4g.small"
}

variable "desired_count_api" {
  type        = number
  description = "Desired number of API task replicas"
  default     = 2
}

variable "desired_count_web" {
  type        = number
  description = "Desired number of Web task replicas"
  default     = 2
}

variable "max_capacity_api" {
  type        = number
  description = "Maximum number of API replicas for auto-scaling"
  default     = 6
}

variable "max_capacity_web" {
  type        = number
  description = "Maximum number of Web replicas for auto-scaling"
  default     = 4
}

variable "rds_instance_class" {
  type        = string
  description = "RDS instance class"
  default     = "db.t4g.medium"
}

variable "rds_allocated_storage" {
  type        = number
  description = "RDS allocated storage in GB"
  default     = 100
}

variable "elasticache_instance_type" {
  type        = string
  description = "ElastiCache instance type"
  default     = "cache.t4g.micro"
}

variable "s3_bucket_versioning" {
  type        = bool
  description = "Enable S3 bucket versioning"
  default     = true
}

variable "enable_rds_enhanced_monitoring" {
  type        = bool
  description = "Enable RDS enhanced monitoring"
  default     = true
}

variable "enable_multi_az" {
  type        = bool
  description = "Enable Multi-AZ for RDS"
  default     = true
}

variable "backup_retention_days" {
  type        = number
  description = "Number of days to retain backups"
  default     = 7
}

variable "cloudwatch_alarm_email" {
  type        = string
  description = "Email for CloudWatch alarm notifications"
  default     = ""
}

variable "certificate_domain" {
  type        = string
  description = "Domain name for SSL certificate"
  default     = "staging.example.com"
}

variable "allowed_cidr_blocks" {
  type        = list(string)
  description = "CIDR blocks allowed to access ALB"
  default     = ["0.0.0.0/0"]
}

variable "enable_waf" {
  type        = bool
  description = "Enable AWS WAF for CloudFront"
  default     = true
}

variable "enable_cloudfront" {
  type        = bool
  description = "Enable CloudFront CDN"
  default     = true
}

variable "tags" {
  type        = map(string)
  description = "Additional tags to apply to resources"
  default = {
    Project = "Secure File Exchange"
    Team    = "Platform"
  }
}
