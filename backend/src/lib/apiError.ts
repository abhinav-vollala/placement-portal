// An error that carries an explicit HTTP status code.
// Routes throw this; the central error handler converts it to a JSON response.
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}
