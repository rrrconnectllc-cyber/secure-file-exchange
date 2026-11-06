output "vpc_id" {
  value       = aws_vpc.main.id
  description = "VPC ID"
}

output "public_subnet_ids" {
  value       = aws_subnet.public[*].id
  description = "Public subnet IDs"
}

output "private_subnet_ids" {
  value       = aws_subnet.private[*].id
  description = "Private subnet IDs"
}

output "alb_security_group_id" {
  value       = aws_security_group.alb.id
  description = "ALB security group ID"
}

output "ecs_security_group_id" {
  value       = aws_security_group.ecs.id
  description = "ECS security group ID"
}

output "rds_security_group_id" {
  value       = aws_security_group.rds.id
  description = "RDS security group ID"
}

output "redis_security_group_id" {
  value       = aws_security_group.redis.id
  description = "Redis security group ID"
}

output "ecs_api_log_group" {
  value       = aws_cloudwatch_log_group.ecs_api.name
  description = "ECS API CloudWatch log group"
}

output "ecs_web_log_group" {
  value       = aws_cloudwatch_log_group.ecs_web.name
  description = "ECS Web CloudWatch log group"
}

output "rds_log_group" {
  value       = aws_cloudwatch_log_group.rds.name
  description = "RDS CloudWatch log group"
}

output "nat_gateway_ips" {
  value       = aws_eip.nat[*].public_ip
  description = "NAT Gateway Elastic IPs"
}

output "deployment_summary" {
  value = {
    environment = var.environment
    region      = var.aws_region
    app_name    = var.app_name
    vpc_cidr    = aws_vpc.main.cidr_block
    azs         = data.aws_availability_zones.available.names
  }
  description = "Deployment summary"
}
