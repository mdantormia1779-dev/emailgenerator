export class AppError extends Error {
  public statusCode: number;
  public userMessage: string;
  public details?: unknown;

  constructor(userMessage: string, statusCode = 400, details?: unknown) {
    super(userMessage);
    this.name = 'AppError';
    this.userMessage = userMessage;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function formatErrorResponse(error: unknown): {
  success: false;
  error: string;
  statusCode: number;
  details?: unknown;
} {
  console.error('[Error Occurred]:', error);

  if (error instanceof AppError) {
    return {
      success: false,
      error: error.userMessage,
      statusCode: error.statusCode,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    // Map known system/auth errors to friendly messages
    const message = error.message.toLowerCase();

    if (message.includes('token expired') || message.includes('invalid_grant')) {
      return {
        success: false,
        error: 'Gmail connection expired. Please reconnect your Gmail account.',
        statusCode: 401,
      };
    }

    if (message.includes('rate limit') || message.includes('quota')) {
      return {
        success: false,
        error: 'AI service is temporarily busy. Please wait a moment and try again.',
        statusCode: 429,
      };
    }

    if (message.includes('unique constraint') || message.includes('already exists')) {
      return {
        success: false,
        error: 'A record with this information already exists.',
        statusCode: 409,
      };
    }
  }

  // Safe default
  return {
    success: false,
    error: 'An unexpected error occurred. Please try again.',
    statusCode: 500,
  };
}
