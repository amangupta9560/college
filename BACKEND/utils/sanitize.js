export const mongoSanitize = (obj) => {
  if (obj instanceof Object) {
    for (let key in obj) {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
      } else {
        mongoSanitize(obj[key]);
      }
    }
  }
  return obj;
};

export const xssClean = (val, key) => {
  if (key && (key.toLowerCase().endsWith('url') || key === 'avatar')) {
    return val;
  }
  if (typeof val === 'string') {
    return val
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  if (Array.isArray(val)) {
    return val.map(x => xssClean(x, key));
  }
  if (val && typeof val === 'object') {
    for (let k in val) {
      val[k] = xssClean(val[k], k);
    }
  }
  return val;
};

export const sanitizeMiddleware = (req, res, next) => {
  if (req.body) {
    req.body = mongoSanitize(req.body);
    req.body = xssClean(req.body);
  }
  if (req.query) {
    req.query = mongoSanitize(req.query);
    req.query = xssClean(req.query);
  }
  if (req.params) {
    req.params = mongoSanitize(req.params);
    req.params = xssClean(req.params);
  }
  next();
};
export default sanitizeMiddleware;
