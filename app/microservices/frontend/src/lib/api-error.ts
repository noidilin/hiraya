export type ApiErrorOptions = {
  status?: number;
  cause?: unknown;
  details?: unknown;
};

export class ApiError extends Error {
  status?: number;
  details?: unknown;

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.details = options.details;
    this.cause = options.cause;
  }
}
