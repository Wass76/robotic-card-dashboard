# API Integration Guide

This document explains how the API integration works and how to configure it for your specific endpoints.

## Base URL

The base URL is configured in `src/services/api.js`:

```javascript
const BASE_URL = 'https://api-cards-robotic-club.tech-sauce.com';
```

## API Endpoints

The following endpoints are currently configured. **You may need to adjust these based on your actual Postman collection:**

### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Attendance
- `GET /attendance` - Get all attendance records
- `GET /attendance/user/:userId` - Get attendance for a specific user
- `GET /attendance/card/:cardId` - Get attendance by card ID

### Statistics
- `GET /stats` - Get dashboard statistics

### Authentication (if needed)
- `POST /auth/login` - Login user

### Cards (if needed)
- `GET /cards` - Get all cards
- `POST /cards` - Create card
- `PUT /cards/:id` - Update card
- `DELETE /cards/:id` - Delete card

## How to Update Endpoints

1. Open `src/services/api.js`
2. Update the endpoint paths to match your Postman collection
3. Adjust request/response data structures if needed
4. Update the data mapping in `src/App.jsx` if the API response format differs

## Authentication

If your API requires authentication:

1. The token is stored in `localStorage` with key `authToken`
2. It's automatically added to all requests via the `Authorization: Bearer <token>` header
3. Update the login function in `api.js` to match your authentication endpoint

## Error Handling

- All API errors are caught and displayed to the user
- If API calls fail, the app falls back to static data (for development)
- Error messages are shown in Arabic at the top of the page

## Data Format

### User Creation Format
```json
{
  "first_name": "Sana",
  "last_name": "Msallam",
  "Phone": "0987675572",
  "email": "sana@gmail.com",
  "password": "sana1234",
  "role": "Admin" // optional, defaults to "User"
}
```

## Testing

1. Make sure your API server is running
2. Check the browser console for any API errors
3. Verify the network tab in DevTools to see actual API calls
4. Update endpoints as needed based on your Postman collection

## Notes

- The app will automatically fetch data on load
- Loading states are shown during API calls
- All CRUD operations (Create, Read, Update, Delete) are integrated
- User attendance records are fetched dynamically when viewing user details

