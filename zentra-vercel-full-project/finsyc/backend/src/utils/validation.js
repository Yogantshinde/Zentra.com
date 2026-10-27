export const isEmail = (value) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
export const cleanText = (value, max = 140) => typeof value === 'string' ? value.trim().slice(0, max) : '';
export const positiveAmount = (value) => Number.isFinite(Number(value)) && Number(value) > 0;
export const validDate = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
