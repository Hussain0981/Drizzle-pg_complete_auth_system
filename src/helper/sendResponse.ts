import type { Response } from "express";

interface SuccessResponseBody<T> {
  success: boolean;
  message: string;
  data: T;
}

interface FailureResponseBody {
  success: boolean;
  message: string;
}

export function successResponse<T>(
  res: Response<SuccessResponseBody<T>>,
  data: T,
  message: string,
  statusCode = 200,
  success = true
): void {
  res.status(statusCode).json({
    success,
    message,
    data,
  });
}

export function failureResponse(
  res: Response<FailureResponseBody>,
  message: string,
  statusCode = 400,
  success = false
): void {
  res.status(statusCode).json({
    success,
    message,
  });
}