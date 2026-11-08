export type Role = 'Top' | 'Jungla' | 'Mid' | 'ADC' | 'Soporte';
export const ROLES: Role[] = ['Top', 'Jungla', 'Mid', 'ADC', 'Soporte'];

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Champion {
  id: number;
  name: string;
  title: string;
  role: Role;
  region: string;
  image_key: string;
}

export interface Build {
  id: number;
  title: string;
  description: string;
  role: Role;
  items: string[];
  runes: string;
  difficulty: number;
  patch: string;
  created_at: string;
  updated_at: string;
  champion: Champion;
  author: string;
  favorites: number;
  is_favorite: boolean;
  is_owner: boolean;
}

export interface BuildPayload {
  title: string;
  description: string;
  champion_id: number;
  role: Role;
  items: string[];
  runes: string;
  difficulty: number;
  patch: string;
}

export type BuildScope = 'all' | 'mine' | 'favorites';

export interface BuildFilters {
  search: string;
  role: string;
  scope: BuildScope;
  championId: number | null;
}

export interface Stats {
  total_builds: number;
  total_champions: number;
  my_builds: number;
  my_favorites: number;
  by_role: { role: string; total: number }[];
  top_champions: { name: string; image_key: string; total: number }[];
}
