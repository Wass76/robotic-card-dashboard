
// Mock Data
const MOCK_USERS = [
  { id: 1, first_name: 'سنا', last_name: 'مسلم', email: 'sana@robotics.club', Phone: '0987654321', phone: '0987654321', role: 'Admin', created_at: '2024-01-15', card_id: '1111', status: 'active', last_seen: '2024-11-24 09:30:00' },
  { id: 2, first_name: 'سلام', last_name: 'مسلم', email: 'salam@robotics.club', Phone: '0987654322', phone: '0987654322', role: 'User', created_at: '2024-01-16', card_id: '2222', status: 'active', last_seen: '2024-11-24 10:15:00' },
  { id: 3, first_name: 'إيمان', last_name: 'غباش', email: 'iman@robotics.club', Phone: '0987654323', phone: '0987654323', role: 'User', created_at: '2024-01-17', card_id: '3333', status: 'active', last_seen: '2024-11-24 11:00:00' },
  { id: 4, first_name: 'حلا', last_name: 'عرقسوسي', email: 'hala@robotics.club', Phone: '0987654324', phone: '0987654324', role: 'User', created_at: '2024-01-18', card_id: '4444', status: 'inactive', last_seen: '2024-11-23 14:20:00' },
  { id: 5, first_name: 'أيمن', last_name: 'الأحمد', email: 'ayman@robotics.club', Phone: '0987654325', phone: '0987654325', role: 'User', created_at: '2024-01-19', card_id: '5555', status: 'active', last_seen: '2024-11-24 08:45:00' },
];

const MOCK_CARDS = [
  { id: 1, card_id: '1111', user_id: 1, status: 'active' },
  { id: 2, card_id: '2222', user_id: 2, status: 'active' },
  { id: 3, card_id: '3333', user_id: 3, status: 'active' },
  { id: 4, card_id: '4444', user_id: 4, status: 'active' },
  { id: 5, card_id: '5555', user_id: 5, status: 'active' }
];

const MOCK_ATTENDANCE = [
  { id: 1, user_id: 1, user_name: 'سنا مسلم', card_id: '1111', timestamp: '2024-11-24 09:30:00', type: 'entry', method: 'RFID' },
  { id: 2, user_id: 2, user_name: 'سلام مسلم', card_id: '2222', timestamp: '2024-11-24 10:15:00', type: 'entry', method: 'Face Recognition' },
  { id: 3, user_id: 3, user_name: 'إيمان غباش', card_id: '3333', timestamp: '2024-11-24 11:00:00', type: 'entry', method: 'RFID' },
  { id: 4, user_id: 1, user_name: 'سنا مسلم', card_id: '1111', timestamp: '2024-11-24 17:30:00', type: 'exit', method: 'RFID' },
  { id: 5, user_id: 4, user_name: 'حلا عرقسوسي', card_id: '4444', timestamp: '2024-11-24 14:20:00', type: 'entry', method: 'Face Recognition' },
  { id: 6, user_id: 5, user_name: 'أيمن الأحمد', card_id: '5555', timestamp: '2024-11-24 08:45:00', type: 'entry', method: 'RFID' },
];

// In-memory storage for mock data (simulates database)
let mockUsers = [...MOCK_USERS];
let mockCards = [...MOCK_CARDS];
let mockAttendance = [...MOCK_ATTENDANCE];

/**
 * Reset mock data to initial state
 */
export const resetMockData = () => {
  mockUsers = [...MOCK_USERS];
  mockCards = [...MOCK_CARDS];
  mockAttendance = [...MOCK_ATTENDANCE];
};

/**
 * Handle mock request
 */
export const handleMockRequest = async (endpoint, options = {}) => {
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body) : {};

  // Authentication endpoints
  if (endpoint.includes('/login')) {
    return handleMockLogin(body);
  }

  if (endpoint.includes('/logoutFromApp')) {
    return { message: 'Logged out successfully' };
  }

  if (endpoint.includes('/profile')) {
    return {
      id: 1,
      name: 'Admin User',
      email: 'admin@robotics.club',
      role: 'Admin',
    };
  }

  // User endpoints
  if (endpoint.includes('/User')) {
    return handleMockUserRequest(endpoint, method, body);
  }

  // Card endpoints
  if (endpoint.includes('/Card')) {
    return handleMockCardRequest(endpoint, method, body);
  }

  // Attendance endpoints
  if (endpoint.includes('attendance') || endpoint.includes('Attendance')) {
    return handleMockAttendanceRequest(endpoint, method);
  }

  // Monthly attendance
  if (endpoint.includes('monthlyAttendance')) {
    return { total: mockAttendance.length };
  }

  // Transaction
  if (endpoint.includes('/Transaction')) {
    return handleMockTransaction(endpoint, method);
  }

  return {};
};

/**
 * Handle mock login
 */
const handleMockLogin = (body) => {
  const email = body.email || 'admin@robotics.club';
  
  return {
    authorisation: { token: 'mock-token-' + Date.now() },
    user: {
      id: 1,
      name: 'Admin User',
      email,
      role: 'Admin',
      first_name: 'Admin',
      last_name: 'User'
    }
  };
};

/**
 * Handle mock user requests
 */
const handleMockUserRequest = (endpoint, method, body) => {
  if (method === 'GET') {
    // Get user by ID
    const idMatch = endpoint.match(/\/User\/(\d+)/);
    if (idMatch) {
      const userId = parseInt(idMatch[1], 10);
      return mockUsers.find(u => u.id === userId) || null;
    }
    
    // Get all users
    return mockUsers;
  }

  if (method === 'POST') {
    // Create user
    const newUser = {
      ...body,
      id: Math.max(...mockUsers.map(u => u.id)) + 1,
      status: body.status || 'active',
      created_at: new Date().toISOString().split('T')[0],
    };
    mockUsers.push(newUser);
    return newUser;
  }

  if (method === 'PUT') {
    // Update user
    const idMatch = endpoint.match(/\/User\/(\d+)/);
    if (idMatch) {
      const userId = parseInt(idMatch[1], 10);
      const index = mockUsers.findIndex(u => u.id === userId);
      if (index !== -1) {
        mockUsers[index] = { ...mockUsers[index], ...body };
        return mockUsers[index];
      }
    }
    return { ...body, id: parseInt(endpoint.split('/').pop(), 10) };
  }

  if (method === 'DELETE') {
    // Delete user
    const idMatch = endpoint.match(/\/User\/(\d+)/);
    if (idMatch) {
      const userId = parseInt(idMatch[1], 10);
      mockUsers = mockUsers.filter(u => u.id !== userId);
      return { message: 'User deleted successfully' };
    }
  }

  return {};
};

/**
 * Handle mock card requests
 */
const handleMockCardRequest = (endpoint, method, body) => {
  if (method === 'GET') {
    // Get card by ID
    const idMatch = endpoint.match(/\/Card\/(\d+)$/);
    if (idMatch) {
      const cardId = parseInt(idMatch[1], 10);
      return mockCards.find(c => c.id === cardId) || null;
    }
    
    // Get all cards
    return mockCards;
  }

  if (method === 'POST') {
    // Create card for user
    const userIdMatch = endpoint.match(/\/Card\/(\d+)$/);
    if (userIdMatch) {
      const userId = parseInt(userIdMatch[1], 10);
      const newCard = {
        ...body,
        id: Math.max(...mockCards.map(c => c.id), 0) + 1,
        user_id: userId,
        status: body.status || 'active',
      };
      mockCards.push(newCard);
      return newCard;
    }
  }

  if (method === 'PUT') {
    // Update card
    const idMatch = endpoint.match(/\/Card\/(\d+)$/);
    if (idMatch) {
      const cardId = parseInt(idMatch[1], 10);
      const index = mockCards.findIndex(c => c.id === cardId);
      if (index !== -1) {
        mockCards[index] = { ...mockCards[index], ...body };
        return mockCards[index];
      }
    }
  }

  if (method === 'DELETE') {
    // Delete card
    const idMatch = endpoint.match(/\/Card\/(\d+)$/);
    if (idMatch) {
      const cardId = parseInt(idMatch[1], 10);
      mockCards = mockCards.filter(c => c.id !== cardId);
      return { message: 'Card deleted successfully' };
    }
  }

  return {};
};

/**
 * Handle mock attendance requests
 */
const handleMockAttendanceRequest = (endpoint, method) => {
  if (method === 'GET') {
    // Get attendance by user ID
    const userIdMatch = endpoint.match(/Attendance_Records_By_UserId\/(\d+)/);
    if (userIdMatch) {
      const userId = parseInt(userIdMatch[1], 10);
      return mockAttendance.filter(a => a.user_id === userId);
    }
    
    // Get all attendance
    return mockAttendance;
  }

  return mockAttendance;
};

/**
 * Handle mock transaction
 */
const handleMockTransaction = (endpoint, method) => {
  if (method === 'POST') {
    const cardIdMatch = endpoint.match(/\/Transaction\/(.+)$/);
    if (cardIdMatch) {
      const cardId = cardIdMatch[1];
      const card = mockCards.find(c => c.card_id === cardId);
      
      if (card) {
        // Create attendance record
        const user = mockUsers.find(u => u.id === card.user_id);
        const newAttendance = {
          id: Math.max(...mockAttendance.map(a => a.id), 0) + 1,
          user_id: card.user_id,
          user_name: user ? `${user.first_name} ${user.last_name}` : 'Unknown',
          card_id: cardId,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          type: 'entry',
          method: 'RFID',
        };
        mockAttendance.unshift(newAttendance);
        return newAttendance;
      }
    }
  }

  return {};
};

