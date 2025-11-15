# Transaction Logs Directory

This directory stores transaction logs for audit and debugging purposes.

## Log Files

### `transactions.log`
Contains all critical transaction events including:
- Order creation
- Payment capture
- Shipment creation/failure
- Refund processing
- Manual interventions

## Log Format

Each line is a JSON object:
```json
{
  "timestamp": "2025-11-15T10:30:45.123Z",
  "level": "INFO|WARNING|ERROR|CRITICAL|SUCCESS",
  "type": "ORDER_CREATED|PAYMENT_CAPTURED|...",
  "message": "Human-readable message",
  "data": { /* Event-specific data */ },
  "environment": "development|production"
}
```

## Usage

### Query Logs by Order
```javascript
import { getTransactionsByOrder } from '@/lib/transactionLogger';
const logs = getTransactionsByOrder('ORD123456');
```

### Get Recent Logs
```javascript
import { getRecentTransactions } from '@/lib/transactionLogger';
const recent = getRecentTransactions(100); // Last 100 entries
```

## Maintenance

- Logs are appended automatically
- Consider rotating logs monthly
- Archive old logs for compliance
- Monitor disk space usage

## Security

- Logs may contain sensitive data
- Restrict access to authorized personnel only
- Do not commit logs to version control (.gitignore)
- Encrypt archived logs

---

**Note:** This directory will be created automatically when the first transaction is logged.
