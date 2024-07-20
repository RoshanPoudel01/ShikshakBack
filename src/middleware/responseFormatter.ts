import { Response } from "express";
export interface ApiResponse<T> {
  data: T;
  status: 0 | 1;
  message: string;
}

export function formatApiResponse<T>(
  data: T,
  status: 0 | 1,
  message: string,
  res: Response
): void {
  const responseData: ApiResponse<T> = { data, status, message };
  res.json(responseData);
}
