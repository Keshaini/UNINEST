const mongoose = require('mongoose');

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');
const normalizeEnum = (value, allowedValues) => {
  const normalized = normalizeString(value).toLowerCase();
  return allowedValues.includes(normalized) ? normalized : null;
};
const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed <= 0 ? fallback : parsed;
};
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const toRegex = (value) => new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
const normalizeChatMessage = (value) => normalizeString(value);

module.exports = {
  normalizeString,
  normalizeEnum,
  toPositiveInt,
  isValidObjectId,
  toRegex,
  normalizeChatMessage,
};
