import { z } from 'zod';

export const userSchema = z.object({
  first_name: z
    .string()
    .min(2, 'الاسم الأول يجب أن يكون على الأقل حرفين')
    .max(50, 'الاسم الأول يجب أن يكون أقل من 50 حرف'),
  last_name: z
    .string()
    .min(2, 'اسم العائلة يجب أن يكون على الأقل حرفين')
    .max(50, 'اسم العائلة يجب أن يكون أقل من 50 حرف'),
  gender: z
    .string()
    .min(1, 'الجنس مطلوب')
    .refine((val) => ['male', 'female'].includes(val.toLowerCase()), {
      message: 'الجنس يجب أن يكون male أو female',
    }),
  Phone: z
    .string()
    .min(10, 'رقم الهاتف يجب أن يكون 10 أرقام')
    .max(10, 'رقم الهاتف يجب أن يكون 10 أرقام')
    .regex(/^\d+$/, 'رقم الهاتف يجب أن يحتوي على أرقام فقط'),
  year: z
    .number()
    .min(1, 'السنة يجب أن تكون على الأقل 1')
    .max(10, 'السنة يجب أن تكون أقل من 10'),
  specialization: z
    .string()
    .min(1, 'التخصص مطلوب')
    .max(255, 'التخصص يجب أن يكون أقل من 255 حرف'),
  email: z
    .string()
    .min(1, 'البريد الإلكتروني مطلوب')
    .email('البريد الإلكتروني غير صحيح')
    .max(255, 'البريد الإلكتروني يجب أن يكون أقل من 255 حرف'),
  password: z
    .string()
    .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل')
    .max(128, 'كلمة المرور يجب أن تكون أقل من 128 حرف'),
  role: z.enum(['Admin', 'User'], {
    errorMap: () => ({ message: 'الدور يجب أن يكون Admin أو User' }),
  }),
});

