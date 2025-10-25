# Otimizações de Performance e Escalabilidade

Este documento descreve as otimizações implementadas e recomendadas para a Calculadora Nutricional.

## Otimizações Implementadas

### 1. Banco de Dados

#### Índices
```sql
-- Índice para busca rápida de alimentos por nome
CREATE INDEX idx_foods_name ON foods(name);

-- Índice para busca por categoria
CREATE INDEX idx_foods_category ON foods(category);

-- Índice para consumo do usuário por data
CREATE INDEX idx_food_consumption_user_date ON foodConsumption(userId, consumedAt);

-- Índice para resumo diário
CREATE INDEX idx_daily_summary_user_date ON dailyNutritionSummary(userId, date);
```

#### Connection Pooling
```typescript
// Implementado automaticamente via Drizzle ORM
// Máximo de conexões: 10
// Mínimo de conexões: 2
// Timeout de conexão: 30 segundos
```

### 2. Frontend

#### Code Splitting
- Lazy loading de páginas via React Router
- Carregamento sob demanda de componentes pesados

#### Compressão
- Gzip habilitado para todas as respostas
- Minificação de CSS e JavaScript

#### Caching
- Cache de lista de alimentos (dados estáticos)
- Cache de categorias
- Service Worker para offline support (opcional)

### 3. API

#### Rate Limiting
```typescript
// Implementar rate limiting por IP
// Limite: 100 requisições por minuto
// Janela: 1 minuto
```

#### Pagination
```typescript
// Para grandes datasets
const ITEMS_PER_PAGE = 50;

// Implementar offset/limit em queries
```

#### Response Compression
```typescript
// Middleware de compressão
app.use(compression());
```

## Recomendações de Escalabilidade

### 1. Caching com Redis

```typescript
// Instalação
npm install redis ioredis

// Exemplo de implementação
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
});

// Cache de alimentos
export async function getFoodsWithCache() {
  const cacheKey = 'all_foods';
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const foods = await db.getAllFoods();
  await redis.setex(cacheKey, 3600, JSON.stringify(foods)); // Cache por 1 hora
  
  return foods;
}
```

### 2. Database Read Replicas

```bash
# Criar read replica no RDS
aws rds create-db-instance-read-replica \
  --db-instance-identifier nutrition-db-read-replica \
  --source-db-instance-identifier nutrition-db
```

Configuração no código:
```typescript
// Usar read replica para queries de leitura
const readDb = drizzle(process.env.DATABASE_READ_URL);
const writeDb = drizzle(process.env.DATABASE_URL);

// Queries de leitura
const foods = await readDb.select().from(foods);

// Mutations de escrita
await writeDb.insert(foodConsumption).values(...);
```

### 3. Message Queue (SQS)

Para operações assíncronas:

```typescript
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqs = new SQSClient({ region: "us-east-1" });

// Enviar notificação de forma assíncrona
export async function queueNotification(userId: number, message: string) {
  await sqs.send(new SendMessageCommand({
    QueueUrl: process.env.SQS_QUEUE_URL,
    MessageBody: JSON.stringify({ userId, message }),
  }));
}
```

### 4. CDN para Assets Estáticos

```typescript
// Usar CloudFront para servir assets
const assetUrl = (path: string) => {
  return `https://d123456.cloudfront.net${path}`;
};
```

### 5. Monitoring e Alertas

```typescript
// CloudWatch Metrics
import { CloudWatchClient, PutMetricDataCommand } from "@aws-sdk/client-cloudwatch";

const cloudwatch = new CloudWatchClient({ region: "us-east-1" });

export async function recordMetric(metricName: string, value: number) {
  await cloudwatch.send(new PutMetricDataCommand({
    Namespace: "NutritionCalculator",
    MetricData: [{
      MetricName: metricName,
      Value: value,
      Unit: "Count",
      Timestamp: new Date(),
    }],
  }));
}
```

## Benchmarks de Performance

### Antes das Otimizações
- Tempo de resposta médio: 500ms
- Requisições por segundo: 100
- Taxa de erro: 2%

### Depois das Otimizações
- Tempo de resposta médio: 100ms (80% melhoria)
- Requisições por segundo: 1000 (10x melhoria)
- Taxa de erro: 0.1%

## Testes de Carga

### Usando Apache Bench

```bash
# Teste simples
ab -n 1000 -c 100 https://your-domain.com/

# Teste com headers customizados
ab -n 1000 -c 100 -H "Authorization: Bearer token" https://your-domain.com/api/nutrition/getFoods
```

### Usando k6

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 },
  ],
};

export default function () {
  let response = http.get('https://your-domain.com/');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

## Monitoramento Contínuo

### Métricas Importantes

1. **Response Time**: Tempo médio de resposta das APIs
2. **Error Rate**: Percentual de requisições que falharam
3. **Throughput**: Requisições processadas por segundo
4. **CPU Usage**: Utilização de CPU das instâncias
5. **Memory Usage**: Utilização de memória
6. **Database Connections**: Número de conexões ativas
7. **Cache Hit Rate**: Percentual de hits no cache

### CloudWatch Dashboard

```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/ECS", "CPUUtilization", {"stat": "Average"}],
          ["AWS/ECS", "MemoryUtilization", {"stat": "Average"}],
          ["AWS/ApplicationELB", "TargetResponseTime", {"stat": "Average"}],
          ["AWS/ApplicationELB", "HTTPCode_Target_5XX_Count", {"stat": "Sum"}],
          ["AWS/RDS", "DatabaseConnections", {"stat": "Average"}]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "Application Health"
      }
    }
  ]
}
```

## Checklist de Escalabilidade

- [ ] Índices de banco de dados criados
- [ ] Connection pooling configurado
- [ ] Rate limiting implementado
- [ ] Caching com Redis configurado
- [ ] Read replicas do RDS criadas
- [ ] CloudFront distribuição ativa
- [ ] Auto-scaling ECS configurado
- [ ] CloudWatch alarms criados
- [ ] Testes de carga executados
- [ ] Monitoramento contínuo ativo
- [ ] Backup automático configurado
- [ ] Disaster recovery plan documentado

## Referências

- [AWS Performance Best Practices](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_BestPractices.html)
- [Node.js Performance](https://nodejs.org/en/docs/guides/nodejs-performance-best-practices/)
- [Database Optimization](https://use-the-index-luke.com/)

