export const ROLES_KEY = 'roles';
export const AUTHORIZATION_TYPE = 'Bearer';

export const STATUS_CODE = {
  UNKNOWN: 520,
};

export const RESPONSE_MESSAGE = {
  INVALID_TOKEN: 'Malformed token',
  MISSING_AUTH: 'Authorization token is missing',
  PERMISSION_DENIED: 'User does not have permission for the action',
  TOKEN_EXPIRED: 'jwt expired',
  UNKNOWN: 'Feel free to inform us about the error',
  USER_MISSING: 'User does not exist',
  EXPENSE_EXCEED: 'Expenses exceeds task budget',
  EXPENSE_PERMISSION_DENIED: 'User cannot initiate expense',
  NOTFOUND_RECORD: 'Record does not exist with id:',
};

export const ERROR_NAME = {
  INVALID_TOKEN: 'JsonWebTokenError',
  MISSING_AUTH: 'MissingToken',
  PERMISSION_DENIED: 'PermissionDenied',
  TOKEN_EXPIRED: 'TokenExpiredError',
  UNKNOWN: 'Unknown',
  USER_MISSING: 'UserMissing',
};

export const TASK_RESPONSE_MESSAGE = {
  DELETE_TASK: 'Detete task success',
};

export const origins = ['http://localhost:5173'];
