export function successResponse(data: any, message = 'Success') {
  return {
    code: 200,
    status: 'success',
    message,
    data,
  }
}

export function errorResponse(code: number, message: string, errors?: any) {
  return {
    code,
    status: 'error',
    message,
    errors,
  }
}
