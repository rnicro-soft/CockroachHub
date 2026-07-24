export interface Admin {
  id: number;
  email: string;
  name: string;
  is_super: boolean;
  must_reset_pw: boolean;
  created_at: string;
  last_login: string | null;
}

export interface Alert {
  id: number;
  type: "medical" | "legal" | "safety" | "general";
  title: string;
  description: string;
  severity: "green" | "yellow" | "red";
  location: string | null;
  is_active: boolean;
  featured: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: number;
  type: string;
  description: string;
  location: string | null;
  status: "pending" | "approved" | "rejected";
  reviewed_by: number | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface FactCheck {
  id: number;
  title: string;
  claim: string;
  verdict: "true" | "false" | "misleading" | "unverified";
  explanation: string;
  source: string | null;
  is_published: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  id: number;
  name: string;
  phone: string;
  category: string;
  description: string | null;
  city: string | null;
  is_verified: boolean;
  updated_at: string;
}

export interface LegalRight {
  id: number;
  title: string;
  content: string;
  category: string;
  sort_order: number;
  updated_at: string;
}

export interface AuthState {
  token: string | null;
  admin: Admin | null;
  setAuth: (token: string, admin: Admin) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}
