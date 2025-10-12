# Escalation Message Fix Summary

## Issue
When tickets exceeded their SLA deadline, the escalation message in the chat box was showing:
```
khushi verma
customer
Internal
Sep 24, 5:15 PM
🚨 ESCALATION: This ticket has exceeded its SLA deadline and requires immediate attention.
```

The problem was that internal escalation notes were showing the customer name instead of the admin who assigned the ticket to the agent.

## Root Cause
1. The SLA scheduler was using `sender_id: 1` for escalation messages
2. User ID 1 was "khushi verma" (a customer) instead of an admin
3. The system wasn't tracking which admin assigned the ticket to the agent

## Solution
Modified `backend/src/utils/slaScheduler.js`:

1. **Fixed default admin ID**: Changed from `sender_id: 1` to `sender_id: 3` (Admin User)
2. **Added admin lookup logic**: Query ticket_history to find the admin who assigned the ticket
3. **Proper fallback**: If no assignment history found, use the default admin (ID 3)

## Key Changes

### Before:
```javascript
// Used customer ID 1 by mistake
await pool.execute(
  'INSERT INTO chat_messages (ticket_id, sender_id, message, is_internal) VALUES (?, ?, ?, TRUE)',
  [ticket.id, 1, escalationMessage]
);
```

### After:
```javascript
// Find the admin who assigned the ticket
const [adminResult] = await pool.execute(`
  SELECT th.changed_by
  FROM ticket_history th
  JOIN users u ON th.changed_by = u.id
  WHERE th.ticket_id = ? AND th.field_name = 'assigned_agent_id' AND u.role = 'admin'
  ORDER BY th.created_at DESC
  LIMIT 1
`, [ticket.id]);

let assigningAdminId = 3; // Default to Admin User (ID 3)
if (adminResult.length > 0) {
  assigningAdminId = adminResult[0].changed_by;
}

// Use the correct admin ID
await pool.execute(
  'INSERT INTO chat_messages (ticket_id, sender_id, message, is_internal) VALUES (?, ?, ?, TRUE)',
  [ticket.id, assigningAdminId, escalationMessage]
);
```

## Result
Now escalation messages show:
```
Admin User
admin
Internal
Sep 25, 2:40 PM
🚨 ESCALATION: This ticket has exceeded its SLA deadline and requires immediate attention.
```

## Files Modified
- `backend/src/utils/slaScheduler.js` - Fixed escalation message sender logic
- `backend/database/migrations/add_internal_notes.sql` - Added is_internal column support
- Test files created to verify the fix

## Verification
Run `node test_new_escalation.js` to verify the fix works correctly.