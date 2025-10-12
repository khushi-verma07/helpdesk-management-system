-- Add support for internal notes in chat messages
ALTER TABLE chat_messages ADD COLUMN is_internal BOOLEAN DEFAULT FALSE;

-- Add index for better performance when filtering internal notes
CREATE INDEX idx_chat_internal ON chat_messages(is_internal);