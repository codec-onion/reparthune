export class AppError extends Error {
  public readonly statusCode: number
  public readonly errorCode?: string
  public readonly context?: Record<string, unknown>
  public readonly isOperational: boolean

  constructor(
    message: string,
    statusCode: number,
    errorCode?: string,
    context?: Record<string, unknown>
  ) {
    super(message)

    this.statusCode = statusCode
    this.errorCode = errorCode
    this.context = context
    this.isOperational = true

    // Nécessaire quand on étend une classe native (Error) en TypeScript,
    // sinon "instanceof AppError" peut se comporter de façon incorrecte
    // selon la cible de compilation.
    Object.setPrototypeOf(this, AppError.prototype)

    Error.captureStackTrace(this, this.constructor)
  }
}