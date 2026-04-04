const validator = require('validator');

// Validate Sri Lankan phone number
const validateSriLankanPhone = (phone) => {
  const pattern = /^(?:0|94|\+94)?(?:(11|21|23|24|25|26|27|31|32|33|34|35|36|37|38|41|45|47|51|52|54|55|57|63|65|66|67|81|91)(0|2|3|4|5|7|9)|7(0|1|2|4|5|6|7|8)\d)\d{6}$/;
  return pattern.test(phone.replace(/\s/g, ''));
};

// Validate SLIIT student ID
const validateStudentId = (studentId) => {
  // Format: IT23123456 (IT + Year + 6 digits)
  const pattern = /^(IT|EN|BA|SE|CS|CSSE|IS|DS|IM|CN|CM)[0-9]{8}$/;
  return pattern.test(studentId);
};

// Validate email
const validateEmail = (email) => {
  return validator.isEmail(email);
};

// Validate amount
const validateAmount = (amount) => {
  return amount > 0 && amount <= 1000000; // Max 1 million LKR
};

// Validate date (not in past for due dates)
const validateFutureDate = (date) => {
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate >= today;
};

// Validate card number (Luhn algorithm)
const validateCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, '');
  
  if (!/^\d{13,19}$/.test(cleaned)) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// Validate CVV
const validateCVV = (cvv) => {
  return /^\d{3,4}$/.test(cvv);
};

// Validate expiry date
const validateExpiryDate = (expiry) => {
  const pattern = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
  if (!pattern.test(expiry)) return false;
  
  const [month, year] = expiry.split('/');
  const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
  const today = new Date();
  
  return expiryDate > today;
};

// Validate bank account number (Sri Lankan)
const validateBankAccount = (accountNumber) => {
  // Sri Lankan bank accounts are typically 10-15 digits
  return /^\d{10,15}$/.test(accountNumber);
};

// Sanitize input to prevent XSS
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return validator.escape(input.trim());
};

module.exports = {
  validateSriLankanPhone,
  validateStudentId,
  validateEmail,
  validateAmount,
  validateFutureDate,
  validateCardNumber,
  validateCVV,
  validateExpiryDate,
  validateBankAccount,
  sanitizeInput
};