export const REDIS_KEYS_FOR_USER = {
  AUTH_USER: 'auth-user',
};

export const REDIS_KEYS_FOR_ASSOCIATE = {
  AFFILIATE_TO: {
    PREFIX: 'user',
    SUFFIX: 'affiliate-to',
  },
};

export const REDIS_KEYS_FOR_TASK = {
  TASK_WITH_ID: 'task-with-id',
};

export const REDIS_TTL_IN_MILISECONDS = 15 * 60 * 1000;
