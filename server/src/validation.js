export function assertNumber(name, value, { min, max, integer = false } = {}) {
  const n = Number(value);
  if (value === undefined || value === null || Number.isNaN(n)) {
    const e = new Error(`${name} is required and must be a number`);
    e.status = 400;
    throw e;
  }
  if (integer && !Number.isInteger(n)) {
    const e = new Error(`${name} must be an integer`);
    e.status = 400;
    throw e;
  }
  if (min != null && n < min) {
    const e = new Error(`${name} must be >= ${min}`);
    e.status = 400;
    throw e;
  }
  if (max != null && n > max) {
    const e = new Error(`${name} must be <= ${max}`);
    e.status = 400;
    throw e;
  }
  return n;
}

export function assertSex(value) {
  if (value !== 'male' && value !== 'female') {
    const e = new Error('sex must be "male" or "female"');
    e.status = 400;
    throw e;
  }
  return value;
}

export function assertDateKey(key) {
  if (!key || !/^\d{4}-\d{2}-\d{2}$/.test(key)) {
    const e = new Error('date must be YYYY-MM-DD');
    e.status = 400;
    throw e;
  }
  return key;
}
