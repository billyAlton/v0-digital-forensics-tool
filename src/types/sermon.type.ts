// src/types/sermon.types.ts
export interface SermonCreateData {
  title: string;
  description?: string;
  pastor_name: string;
  sermon_date: string;
  scripture_reference?: string;
  video_url?: string;
  audio_url?: string;
  transcript?: string;
  series?: string;
  tags?: string;
}

export interface SermonUpdateData {
  title?: string;
  description?: string;
  pastor_name?: string;
  sermon_date?: string;
  scripture_reference?: string;
  video_url?: string;
  audio_url?: string;
  transcript?: string;
  series?: string;
  tags?: string;
}

export interface SermonSearchParams {
  query?: string;
  pastor?: string;
  series?: string;
  tags?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface SermonResponse {
  success: boolean;
  data:any |any[];
  message?: string;
  count?: number;
}