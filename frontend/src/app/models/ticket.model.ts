export interface Ticket {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'on_hold' | 'resolved' | 'closed';
  category?: string;
  sla_deadline: string;
  created_at: string;
  updated_at: string;
  customer_id: number;
  assigned_agent_id?: number;
  customer_first_name?: string;
  customer_last_name?: string;
  customer_email?: string;
  agent_first_name?: string;
  agent_last_name?: string;
  agent_email?: string;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
}

export interface TicketMessage {
  id: number;
  ticket_id: number;
  sender_id: number;
  message: string;
  created_at: string;
  first_name: string;
  last_name: string;
  role: string;
  is_internal?: boolean;
}