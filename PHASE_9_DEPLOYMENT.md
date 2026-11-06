# Phase 9: AWS Staging Deployment

**Timeline:** 1 week | **Target:** Production staging ready for pilot  
**Infrastructure:** ECS, RDS, ElastiCache, S3, CloudFront, ALB  
**Cost:** $200-300/month

## 9.1: Architecture Overview

```
┌─────────────────────────────────────────────┐
│         CloudFront CDN (Global)             │
├─────────────────────────────────────────────┤
│    AWS Certificate Manager (HTTPS/TLS)     │
├─────────────────────────────────────────────┤
│   Application Load Balancer (Multi-AZ)     │
├──────────────┬──────────────────────────────┤
│ ECS Cluster  │ Target Groups               │
├──────────────┼──────────────────────────────┤
│ API Service  │ Web Service                 │
│ 2-6 replicas │ 2-4 replicas               │
└──────────────┴──────────────────────────────┘
         │              │              │
    ┌────┴──────┬──────┴──────┬───────┴─────┐
    │            │             │             │
┌────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐
│  RDS   │ │ ElastiC │ │    S3    │ │ Secrets │
│ Multi- │ │ ache    │ │ Versiona│ │ Manager │
│  AZ    │ │ Redis   │ │    ted   │ │         │
└────────┘ └──────────┘ └──────────┘ └─────────┘
```

## 9.2: Infrastructure as Code (Terraform)

Key Terraform modules:
- **networking.tf:** VPC, subnets, security groups
- **ecs.tf:** Cluster, services, auto-scaling
- **rds.tf:** PostgreSQL Multi-AZ database
- **elasticache.tf:** Redis cluster
- **monitoring.tf:** CloudWatch dashboards & alarms

## 9.3: Docker Images

Building production-ready images:
- Base: node:22-alpine (lightweight)
- API: 2 vCPU, 4GB RAM, health checks
- Web: 1 vCPU, 2GB RAM, next build optimized

## 9.4: Database & Cache

**RDS Configuration:**
- Instance: db.t4g.medium (Multi-AZ failover)
- Automated backups (7 days)
- Enhanced monitoring enabled
- Encryption at rest (AWS KMS)

**ElastiCache (Redis):**
- Cluster mode: disabled
- Multi-AZ replication
- Automatic failover
- Encryption in transit & at rest

## 9.5: Auto-Scaling Policies

API Service:
- Min replicas: 2
- Max replicas: 6
- Target CPU: 70%
- Scale cooldown: 300 seconds

## 9.6: Monitoring & Alarms

CloudWatch Dashboards:
- API performance (latency, errors, requests)
- Database metrics (connections, CPU, storage)
- Business metrics (uploads, users, storage usage)

Alarms (SNS → Slack/PagerDuty):
- API error rate > 5%
- Database CPU > 80%
- Storage usage growth
- Health check failures

## 9.7: Cost Estimate

```
ECS (Fargate):     $50/month
RDS (db.t4g.med):  $80/month
ElastiCache:       $20/month
S3 Storage:        $20/month
CloudFront:        $10/month
ALB:               $25/month
Data transfer:     $15/month
─────────────────────────────
TOTAL:            $220/month
```

## 9.8: Deployment Steps

1. **Build Docker images** → Push to ECR
2. **Create RDS instance** → Run migrations
3. **Launch ECS cluster** → Deploy services
4. **Configure CloudFront** → Enable HTTPS
5. **Setup monitoring** → Configure alarms
6. **Verify deployment** → Health checks pass
7. **Run smoke tests** → API & web responding

## 9.9: Success Criteria

✅ ECS tasks healthy (2+ replicas each)  
✅ RDS accessible with migrations run  
✅ CloudFront serving HTTPS  
✅ Health checks at 100%  
✅ CloudWatch logs streaming  
✅ Auto-scaling policies active  
✅ Alarms receiving metrics  
✅ Database backups automated  
✅ All endpoints responding  

---

**Status:** Ready to deploy  
**Next Phase:** Phase 10 Security Review Package
