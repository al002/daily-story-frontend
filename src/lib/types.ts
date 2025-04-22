// src/lib/types.ts
export interface Story {
  id: number;
  title: string;
  content: string;
  date: string;
  aiSource?: string;
  createdAtUtc: string;
  formattedDate?: string;
}

export interface ApiError {
  error: string;
  detail?: string;
  title?: string;
  status?: number;
}
