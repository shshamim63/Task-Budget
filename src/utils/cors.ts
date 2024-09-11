import { origins } from './constants';

export const validateOrigin = (origin, callback) => {
  if (origins.indexOf(origin) !== -1 || !origin) callback(null, true);
  callback(new Error('Not allowed by CORS'));
};
