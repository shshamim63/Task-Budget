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
};

export const ERROR_NAME = {
  INVALID_TOKEN: 'JsonWebTokenError',
  MISSING_AUTH: 'MissingToken',
  PERMISSION_DENIED: 'PermissionDenied',
  TOKEN_EXPIRED: 'TokenExpiredError',
  UNKNOWN: 'Unknown',
  USER_MISSING: 'UserMissing',
};

export const origins = ['http://localhost:3000'];