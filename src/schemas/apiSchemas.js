import { z } from 'zod';

// User schemas
export const userApiSchema = z.object({
  id: z.number().or(z.string()),
  first_name: z.string().optional(),
  firstName: z.string().optional(),
  last_name: z.string().optional(),
  lastName: z.string().optional(),
  Phone: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const usersArraySchema = z.array(userApiSchema).or(
  z.object({
    data: z.array(userApiSchema).or(z.array(z.array(userApiSchema))),
  })
);

// Card schemas
export const cardApiSchema = z.object({
  id: z.number().or(z.string()),
  card_id: z.string().optional(),
  user_id: z.number().or(z.string()).optional(),
  status: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const cardsArraySchema = z.array(cardApiSchema).or(
  z.object({
    data: z.array(cardApiSchema),
  })
);

// Attendance schemas
export const attendanceApiSchema = z.object({
  id: z.number().or(z.string()),
  user_id: z.number().or(z.string()).optional(),
  user_name: z.string().optional(),
  card_id: z.string().optional(),
  timestamp: z.string().or(z.date()),
  type: z.enum(['entry', 'exit']).optional(),
  method: z.string().optional(),
});

export const attendanceArraySchema = z.array(attendanceApiSchema).or(
  z.object({
    data: z.array(attendanceApiSchema),
  })
);

// Monthly attendance schema
export const monthlyAttendanceSchema = z.object({
  total: z.number().optional(),
  month: z.string().optional(),
  year: z.number().optional(),
});

// Login response schema
export const loginResponseSchema = z.object({
  code: z.number().optional(),
  message: z.string().optional(),
  data: z.object({
    id: z.number().or(z.string()).optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().email().optional(),
    token: z.string(),
  }).or(z.object({
    token: z.string(),
  })),
  token: z.string().optional(),
});



