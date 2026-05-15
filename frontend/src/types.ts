export type MemberRole = "admin" | "member";
export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in_progress" | "done";

export interface UserPublic {
  id: string;
  name: string;
  email: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserPublic;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  created_by_id: string;
  created_at: string;
}

export interface ProjectMember {
  user_id: string;
  role: MemberRole;
  user: UserPublic;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  assignee_id: string | null;
  created_by_id: string;
  created_at: string;
}

export interface Dashboard {
  total_tasks: number;
  tasks_by_status: Record<string, number>;
  tasks_per_user: { user_id: string | null; name: string; email: string | null; count: number }[];
  overdue_count: number;
  overdue_tasks: Task[];
}
