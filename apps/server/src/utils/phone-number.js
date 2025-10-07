export function sanitisePhoneNumber(input) {
  if (typeof input !== 'string') {
    throw new Error('Phone number must be a string');
  }

  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error('Phone number is required');
  }

  const digitsOnly = trimmed.replace(/\D/g, '');
  if (digitsOnly.length < 6) {
    throw new Error('Phone number must contain at least 6 digits');
  }

  return digitsOnly;
}

export function comparePhoneNumbers(a, b) {
  if (!a || !b) {
    return false;
  }
  try {
    return sanitisePhoneNumber(String(a)) === sanitisePhoneNumber(String(b));
  } catch (error) {
    return false;
  }
}
