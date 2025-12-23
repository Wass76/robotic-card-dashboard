/**
 * Transform API response to frontend format (snake_case to camelCase)
 */
export const transformApiToFrontend = (data) => {
  if (Array.isArray(data)) {
    return data.map(transformApiToFrontend);
  }

  if (data && typeof data === 'object' && !(data instanceof Date)) {
    const transformed = {};
    
    for (const key in data) {
      const camelKey = snakeToCamel(key);
      transformed[camelKey] = transformApiToFrontend(data[key]);
    }
    
    return transformed;
  }

  return data;
};

/**
 * Transform frontend data to API format (camelCase to snake_case)
 */
export const transformFrontendToApi = (data) => {
  if (Array.isArray(data)) {
    return data.map(transformFrontendToApi);
  }

  if (data && typeof data === 'object' && !(data instanceof Date)) {
    const transformed = {};
    
    for (const key in data) {
      const snakeKey = camelToSnake(key);
      transformed[snakeKey] = transformFrontendToApi(data[key]);
    }
    
    return transformed;
  }

  return data;
};

/**
 * Convert snake_case to camelCase
 */
const snakeToCamel = (str) => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Convert camelCase to snake_case
 * Preserves certain keys that API expects with specific casing (e.g., Phone)
 */
const camelToSnake = (str) => {
  // Preserve keys that API expects with capital letters
  const preservedKeys = ['Phone']; // API expects Phone, not phone or _phone
  if (preservedKeys.includes(str)) {
    return str;
  }
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

/**
 * Transform user object
 */
export const transformUser = (user) => {
  if (!user) return null;
  
  return {
    id: user.id,
    firstName: user.first_name || user.firstName,
    lastName: user.last_name || user.lastName,
    email: user.email,
    phone: user.phone || user.Phone,
    role: user.role,
    createdAt: user.created_at || user.createdAt,
    cardId: user.card_id || user.cardId,
    status: user.status,
    lastSeen: user.last_seen || user.lastSeen,
  };
};

/**
 * Transform user object back to API format
 */
export const transformUserToApi = (user) => {
  if (!user) return null;
  
  return {
    id: user.id,
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    Phone: user.phone, // API expects Phone
    phone: user.phone,
    role: user.role,
    created_at: user.createdAt,
    card_id: user.cardId,
    status: user.status,
    last_seen: user.lastSeen,
  };
};

/**
 * Transform card object
 */
export const transformCard = (card) => {
  if (!card) return null;
  
  return {
    id: card.id,
    cardId: card.card_id || card.cardId,
    userId: card.user_id || card.userId,
    status: card.status,
  };
};

/**
 * Transform card object back to API format
 */
export const transformCardToApi = (card) => {
  if (!card) return null;
  
  return {
    id: card.id,
    card_id: card.cardId,
    user_id: card.userId,
    status: card.status,
  };
};

/**
 * Transform attendance record
 */
export const transformAttendance = (attendance) => {
  if (!attendance) return null;
  
  return {
    id: attendance.id,
    userId: attendance.user_id || attendance.userId,
    userName: attendance.user_name || attendance.userName,
    cardId: attendance.card_id || attendance.cardId,
    timestamp: attendance.timestamp,
    type: attendance.type,
    method: attendance.method,
  };
};

