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

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required. Please sign in.') {
    super(message, 401);
    this.name = 'UnauthorizedError';
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

    if (
      message.includes('database_url') ||
      message.includes('p1001') ||
      message.includes('p1000') ||
      message.includes('can\'t reach database server') ||
      message.includes('connection timed out') ||
      message.includes('econnrefused')
    ) {
      return {
        success: false,
        error: 'Database connection error. Please ensure DATABASE_URL is configured and database is reachable.',
        statusCode: 503,
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
