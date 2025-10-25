# Guia de Implantação na AWS

Este documento fornece instruções detalhadas para implantar a Calculadora Nutricional na AWS.

## Arquitetura Recomendada

```
┌─────────────────────────────────────────────────────────────┐
│                        CloudFront (CDN)                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Application Load Balancer                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              ECS Fargate (Node.js Application)               │
│  - Auto-scaling baseado em CPU/Memória                      │
│  - Health checks automáticos                                │
│  - Logs centralizados no CloudWatch                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│         RDS MySQL (Banco de Dados Gerenciado)               │
│  - Multi-AZ para alta disponibilidade                       │
│  - Backups automáticos                                      │
│  - Encryption em repouso                                    │
└─────────────────────────────────────────────────────────────┘
```

## Pré-requisitos

1. Conta AWS ativa
2. AWS CLI instalado e configurado
3. Docker instalado localmente
4. Node.js 18+ instalado

## Passos de Implantação

### 1. Preparar a Aplicação

```bash
# Build da aplicação
npm run build

# Testar localmente
npm run preview
```

### 2. Criar Imagem Docker

```bash
# Build da imagem Docker
docker build -t nutrition-calculator:latest .

# Testar localmente
docker run -p 3000:3000 \
  -e DATABASE_URL="mysql://user:password@localhost:3306/nutrition" \
  nutrition-calculator:latest
```

### 3. Configurar AWS RDS MySQL

```bash
# Criar banco de dados RDS
aws rds create-db-instance \
  --db-instance-identifier nutrition-db \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --master-username admin \
  --master-user-password YourSecurePassword123! \
  --allocated-storage 20 \
  --storage-type gp2 \
  --publicly-accessible false \
  --multi-az \
  --backup-retention-period 30
```

### 4. Fazer Push da Imagem para ECR

```bash
# Criar repositório ECR
aws ecr create-repository --repository-name nutrition-calculator

# Fazer login no ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Tag da imagem
docker tag nutrition-calculator:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/nutrition-calculator:latest

# Push da imagem
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/nutrition-calculator:latest
```

### 5. Criar Cluster ECS

```bash
# Criar cluster
aws ecs create-cluster --cluster-name nutrition-cluster

# Criar task definition (veja arquivo ecs-task-definition.json)
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json
```

### 6. Criar Application Load Balancer

```bash
# Criar ALB
aws elbv2 create-load-balancer \
  --name nutrition-alb \
  --subnets subnet-xxxxx subnet-yyyyy \
  --security-groups sg-xxxxx \
  --scheme internet-facing \
  --type application

# Criar target group
aws elbv2 create-target-group \
  --name nutrition-targets \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-xxxxx \
  --health-check-path /api/health \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3
```

### 7. Criar ECS Service

```bash
# Criar serviço ECS
aws ecs create-service \
  --cluster nutrition-cluster \
  --service-name nutrition-service \
  --task-definition nutrition-task:1 \
  --desired-count 2 \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=nutrition,containerPort=3000 \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx,subnet-yyyyy],securityGroups=[sg-xxxxx],assignPublicIp=DISABLED}" \
  --launch-type FARGATE
```

### 8. Configurar Auto-Scaling

```bash
# Registrar serviço para auto-scaling
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/nutrition-cluster/nutrition-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

# Criar política de scaling baseada em CPU
aws application-autoscaling put-scaling-policy \
  --policy-name nutrition-cpu-scaling \
  --service-namespace ecs \
  --resource-id service/nutrition-cluster/nutrition-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

### 9. Configurar CloudFront

```bash
# Criar distribuição CloudFront para cache
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

## Variáveis de Ambiente

Configure as seguintes variáveis no AWS Secrets Manager:

```bash
aws secretsmanager create-secret \
  --name nutrition-app-secrets \
  --secret-string '{
    "DATABASE_URL": "mysql://user:password@nutrition-db.xxxxx.us-east-1.rds.amazonaws.com:3306/nutrition",
    "JWT_SECRET": "your-secret-key-here",
    "NODE_ENV": "production",
    "VITE_APP_TITLE": "Calculadora Nutricional",
    "VITE_APP_LOGO": "https://your-domain.com/logo.png"
  }'
```

## Monitoramento e Logging

### CloudWatch Logs

```bash
# Ver logs da aplicação
aws logs tail /ecs/nutrition-task --follow
```

### CloudWatch Alarms

```bash
# Criar alarme para CPU alta
aws cloudwatch put-metric-alarm \
  --alarm-name nutrition-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

## Otimizações para Escalabilidade

### 1. Caching

- Implementar Redis para cache de sessões
- Cache de lista de alimentos (dados estáticos)
- Cache de consultas frequentes

### 2. Banco de Dados

- Usar read replicas para distribuir carga de leitura
- Implementar índices nas colunas frequentemente consultadas
- Connection pooling com máximo de conexões

### 3. CDN

- Servir assets estáticos via CloudFront
- Compressão gzip para respostas
- Cache headers apropriados

### 4. Aplicação

- Implementar rate limiting
- Usar compression middleware
- Implementar pagination para grandes datasets

## Backup e Recuperação

```bash
# Criar snapshot manual do RDS
aws rds create-db-snapshot \
  --db-instance-identifier nutrition-db \
  --db-snapshot-identifier nutrition-db-backup-$(date +%Y%m%d)

# Restaurar de snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier nutrition-db-restored \
  --db-snapshot-identifier nutrition-db-backup-20240101
```

## Segurança

### 1. Encryption

- Ativar encryption em repouso no RDS
- Usar SSL/TLS para comunicação
- Armazenar secrets no AWS Secrets Manager

### 2. IAM Roles

```bash
# Criar role para ECS
aws iam create-role \
  --role-name ecsTaskExecutionRole \
  --assume-role-policy-document file://trust-policy.json

# Anexar política
aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

### 3. Security Groups

```bash
# ALB Security Group
aws ec2 create-security-group \
  --group-name nutrition-alb-sg \
  --description "Security group for ALB"

# Permitir HTTP/HTTPS
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0
```

## Custos Estimados (Mensal)

| Serviço | Configuração | Custo Estimado |
|---------|--------------|----------------|
| ECS Fargate | 2 tasks, 0.5 CPU, 1GB RAM | $15-20 |
| RDS MySQL | db.t3.micro, 20GB storage | $20-30 |
| ALB | 1 ALB, 1M requests | $15-20 |
| CloudFront | 100GB data transfer | $10-15 |
| **Total** | | **$60-85** |

## Troubleshooting

### Aplicação não inicia

```bash
# Verificar logs
aws logs tail /ecs/nutrition-task --follow

# Verificar task definition
aws ecs describe-task-definition --task-definition nutrition-task
```

### Banco de dados não conecta

```bash
# Testar conexão
mysql -h nutrition-db.xxxxx.us-east-1.rds.amazonaws.com -u admin -p

# Verificar security group
aws ec2 describe-security-groups --group-ids sg-xxxxx
```

### Performance lenta

```bash
# Verificar métricas
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=nutrition-service \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 300 \
  --statistics Average
```

## Referências

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [AWS RDS Best Practices](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_BestPractices.html)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)

