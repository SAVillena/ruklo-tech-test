
# 📊 Ruklo Test - Documentación de Decisiones Técnicas

## 🏗️ Arquitectura Elegida

### 🔧 Patrón Modular con NestJS

El proyecto está organizado en módulos separados para mejorar el mantenimiento, la escalabilidad y el testing.

- `Events`: Carga y gestión de datos de eventos
- `Benefits`: Lógica de negocio para otorgar beneficios
- `Analytics`: Generación de reportes y análisis de transacciones

---

## ✅ Parte 1 - Beneficios por Visitas Consecutivas

### ✔️ Implementado

- **Agrupación de eventos** por `client_id` y `store_id`
- **Orden temporal** por `timestamp`
- **Contador en memoria** de visitas consecutivas (reiniciado por recargas)
- **Creación de entidad `Benefit`** si se cumplen 5 visitas seguidas sin recarga
- **Estructura de datos clara y trazable**

```ts
class Benefit {
  id: string;
  client_id: string;
  store_id: string;
  type: string;
  description: string;
  awarded_at: Date;
  qualifying_events: string[];
}
```

---

## ✅ Parte 2 - Historial de Transacciones con Promedios Semanales

### ✔️ Implementado

- Agrupación de eventos por tipo (`visit` y `recharge`)
- Cálculo semanal basado en `timestamp`
- Inclusión de semanas sin recargas (promedio 0)
- Formato de semana consistente: `YYYY-WW`

```ts
interface ClientTransactionHistory {
  client_id: string;
  visits: {
    total: number;
    events: EventData[];
  };
  recharges: {
    total: number;
    totalAmount: number;
    events: EventData[];
    weeklyData: WeeklyRechargeData[];
  };
}
```

---

## ⚠️ Limitaciones Actuales

### Parte 1: Beneficios

- `Memoria`: El almacenamiento de beneficios es volátil (no persistente)
- `Concurrencia`: No hay manejo para eventos simultáneos
- `Escalabilidad`: Complejidad `O(n²)` por cliente y tienda
- `Persistencia`: No se guardan estados intermedios ni históricos

### Parte 2: Analytics

- `Tiempo real`: No hay cacheo de resultados ya calculados
- `Memoria`: Todo se mantiene en RAM
- `Consultas`: No hay preprocesamiento para consultas repetidas

---

## 🚀 Arquitectura Recomendada para Escalabilidad

### 1. Base de Datos

Uso de PostgreSQL para almacenar y consultar eventos de forma eficiente.

```sql
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    client_id VARCHAR(50) NOT NULL,
    store_id VARCHAR(50) NOT NULL,
    type VARCHAR(10) NOT NULL,
    amount DECIMAL(10,2),
    timestamp TIMESTAMP NOT NULL,
    processed_at TIMESTAMP DEFAULT NOW()
);

-- Índices para acelerar consultas
CREATE INDEX idx_events_client_store_time ON events(client_id, store_id, timestamp);
CREATE INDEX idx_events_timestamp ON events(timestamp);
CREATE INDEX idx_events_type ON events(type);
```

---

### 2. Sistema de Colas

Procesamiento asincrónico con Redis y BullMQ:

- `Batching`: Procesar eventos en lotes de 1000
- `Retry`: Manejo de fallos con backoff exponencial
- `Workers`: Escalables horizontalmente

---

### 3. Caché Estratégico

Uso de Redis para guardar estados temporales por cliente + tienda:

```ts
const visitCounter = await redis.hget(`visits:${clientId}:${storeId}`, 'count');
const lastEventType = await redis.hget(`visits:${clientId}:${storeId}`, 'lastType');

if (event.type === 'recharge') {
  await redis.del(`visits:${clientId}:${storeId}`);
}
```

---

### 4. Agregaciones Pre-calculadas

- **Tablas de resumen** semanales o mensuales
- **Views materializadas** para acelerar consultas analíticas
- **ETL Jobs** nocturnos que actualizan estadísticas

---

### 5. Monitoreo y Observabilidad

- `Métricas`: Eventos por segundo, latencia, errores
- `Alertas`: Fallos, saturación de colas, demoras
- `Dashboards`: Visualización en tiempo real

---


## 🔧 Stack Tecnológico Recomendado para Producción

| Capa | Herramienta |
|------|-------------|
| Backend | NestJS + TypeScript |
| Base de Datos | PostgreSQL (con particionado por fecha) |
| Caché | Redis |
| Colas | BullMQ |
| Monitoreo |  Grafana |
| Logging | Winston + ELK Stack |

---

## 🧠 Conclusión

Las propuestas de escalabilidad están pensadas para escenarios reales de alto tráfico y volumen.
