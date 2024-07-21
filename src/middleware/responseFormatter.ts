import { Response } from "express";
export interface ApiResponse<T> {
  data: T;
  status: 0 | 1;
  message: string;
  token?: string;
}

export function formatApiResponse<T>(
  data: T,
  status: 0 | 1,
  message: string,
  res: Response,
  token?: string
): void {
  const responseData: ApiResponse<T> = { data, status, message, token };
  res.json(responseData);
}
