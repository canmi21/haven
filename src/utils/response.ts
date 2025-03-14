// RESTful + WebSocket
export enum StatusCode {
  SUCCESS = 200,
  CREATED = 201,
  NO_CONTENT = 204,

  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,

  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

export const StatusMessage: Record<StatusCode, string> = {
  [StatusCode.SUCCESS]: 'Success',
  [StatusCode.CREATED]: 'Resource created successfully',
  [StatusCode.NO_CONTENT]: 'No content',

  [StatusCode.BAD_REQUEST]: 'Invalid request payload',
  [StatusCode.UNAUTHORIZED]: 'Unauthorized access',
  [StatusCode.FORBIDDEN]: 'Access forbidden',
  [StatusCode.NOT_FOUND]: 'Resource not found',
  [StatusCode.CONFLICT]: 'Data conflict detected',
  [StatusCode.UNPROCESSABLE_ENTITY]: 'Unprocessable entity',
  [StatusCode.TOO_MANY_REQUESTS]: 'Too many requests',

  [StatusCode.INTERNAL_SERVER_ERROR]: 'Internal server error',
  [StatusCode.SERVICE_UNAVAILABLE]: 'Service is temporarily unavailable',
}

export function successResponse<T>(
  data: T,
  message = StatusMessage[StatusCode.SUCCESS],
  code = StatusCode.SUCCESS
) {
  return {
    code,
    status: 'success',
    message,
    data,
  }
}

export function errorResponse(
  code: StatusCode,
  message = StatusMessage[code],
  errors?: any
) {
  return {
    code,
    status: 'error',
    message,
    errors,
  }
}
