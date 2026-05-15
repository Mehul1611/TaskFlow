import type { Dashboard, Project, ProjectMember, Task, TokenResponse, UserPublic } from "./types";

const prefix = "/api/v1";

function parseError(data: unknown): string {
  if (!data || typeof data !== "object") return "Request failed";
  const detail = (data as { detail?: unknown }).detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((x) =>
        typeof x === "object" && x !== null && "msg" in x ? String((x as { msg: string }).msg) : JSON.stringify(x),
      )
      .join("; ");
  }
  return "Request failed";
}

export function getStoredToken(): string | null {
  return localStorage.getItem("ethara_token");
}

export function getStoredUser(): UserPublic | null {
  const raw = localStorage.getItem("ethara_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserPublic;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem("ethara_token");
  localStorage.removeItem("ethara_user");
}

export function saveSession(token: string, user: UserPublic): void {
  localStorage.setItem("ethara_token", token);
  localStorage.setItem("ethara_user", JSON.stringify(user));
}

async function request<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const headers: HeadersInit = { ...(init.headers as HeadersInit) };
  const token = getStoredToken();
  if (token) (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  let body: BodyInit | undefined = init.body;
  if (init.json !== undefined) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
    body = JSON.stringify(init.json);
  }
  const res = await fetch(`${prefix}${path}`, { ...init, headers, body });
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = { detail: text };
    }
  }
  if (!res.ok) throw new Error(parseError(data));
  return data as T;
}

export async function register(name: string, email: string, password: string): Promise<TokenResponse> {
  return request<TokenResponse>("/auth/register", { method: "POST", json: { name, email, password } });
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  return request<TokenResponse>("/auth/login", { method: "POST", json: { email, password } });
}

export async function listProjects(): Promise<Project[]> {
  return request<Project[]>("/projects", { method: "GET" });
}

export async function createProject(name: string, description: string | null): Promise<Project> {
  return request<Project>("/projects", { method: "POST", json: { name, description } });
}

export async function getProject(projectId: string): Promise<Project> {
  return request<Project>(`/projects/${projectId}`, { method: "GET" });
}

export async function listMembers(projectId: string): Promise<ProjectMember[]> {
  return request<ProjectMember[]>(`/projects/${projectId}/members`, { method: "GET" });
}

export async function addMember(projectId: string, email: string, role: "admin" | "member"): Promise<ProjectMember> {
  return request<ProjectMember>(`/projects/${projectId}/members`, { method: "POST", json: { email, role } });
}

export async function removeMember(projectId: string, userId: string): Promise<void> {
  return request<void>(`/projects/${projectId}/members/${userId}`, { method: "DELETE" });
}

export async function listTasks(projectId: string): Promise<Task[]> {
  return request<Task[]>(`/projects/${projectId}/tasks`, { method: "GET" });
}

export async function createTask(
  projectId: string,
  body: {
    title: string;
    description?: string | null;
    due_date?: string | null;
    priority?: string;
    assignee_id?: string | null;
  },
): Promise<Task> {
  return request<Task>(`/projects/${projectId}/tasks`, { method: "POST", json: body });
}

export async function updateTask(
  taskId: string,
  body: Partial<{
    title: string;
    description: string | null;
    due_date: string | null;
    priority: string;
    status: string;
    assignee_id: string | null;
  }>,
): Promise<Task> {
  return request<Task>(`/tasks/${taskId}`, { method: "PATCH", json: body });
}

export async function deleteTask(taskId: string): Promise<void> {
  return request<void>(`/tasks/${taskId}`, { method: "DELETE" });
}

export async function getDashboard(projectId: string): Promise<Dashboard> {
  return request<Dashboard>(`/projects/${projectId}/dashboard`, { method: "GET" });
}
