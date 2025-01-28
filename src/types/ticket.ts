export interface Ticket {
  id: number;
  state?: string;
  created_at?: string;
  read?: boolean;
  priority?: string;
  summary?: string;
  sentiment?: string;
  category?: string;
  subcategory?: string;
  issue?: string;
  common_issue?: string;
  responsible_department?: string;
  responsible_department_justification?: string;
  issue_summary?: string;
  link?: string;
  report_period?: string;
  company_name?: string;
}

export interface GroupedTickets {
  tickets: Ticket[];
  count: number;
  summary: string;
  department: string;
}

export interface TicketGroups {
  [key: string]: GroupedTickets;
}