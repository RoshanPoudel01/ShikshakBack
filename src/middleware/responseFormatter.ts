import { Response } from "express";
export interface ApiResponse<T> {
  data: T;
  status: 0 | 1;
  message: string;
  access_token?: string;
  refresh_token?: string;
}

export function formatApiResponse<T>(
  data: T,
  status: 0 | 1,
  message: string,
  res: Response,
  access_token?: string,
  refresh_token?: string
): void {
  const responseData: ApiResponse<T> = {
    data,
    status,
    message,
    access_token,
    refresh_token,
  };
  res.json(responseData);
}
