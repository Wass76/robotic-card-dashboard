// Format date in Arabic locale
export const formatDate = (date, locale = 'ar-SA') => {
  if (!date) return '';
  return new Date(date).toLocaleDateString(locale);
};

// Format time in Arabic locale
export const formatTime = (date, locale = 'ar-SA') => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString(locale, { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

// Format date and time
export const formatDateTime = (date, locale = 'ar-SA') => {
  if (!date) return '';
  return new Date(date).toLocaleString(locale);
};

// Format full name
export const formatName = (firstName, lastName) => {
  return `${firstName || ''} ${lastName || ''}`.trim();
};

// Format phone number display
export const formatPhone = (phone) => {
  if (!phone) return '';
  // Format: 0987 655 432
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  return phone;
};

