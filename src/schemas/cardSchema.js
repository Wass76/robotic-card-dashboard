import { z } from 'zod';

export const cardSchema = z.object({
  code: z
    .string()
    .min(4, 'رقم البطاقة يجب أن يكون على الأقل 4 أحرف')
    .max(20, 'رقم البطاقة يجب أن يكون أقل من 20 حرف'),
  user_id: z
    .string()
    .min(1, 'المستخدم مطلوب')
    .or(z.number().min(1)),
  // Keep card_id for backward compatibility (for edit mode)
  card_id: z.string().optional(),
});

