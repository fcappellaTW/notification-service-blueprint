import { z } from 'zod';

export const notificationPayloadSchema = z.object({
  recipientEmail: z.email({
    message: 'Invalid email format',
  }),

  subject: z.string().min(1, { message: 'subject cannot be empty' }),

  body: z.string().min(1, { message: 'body cannot be empty' }),
});

export type NotificationPayload = z.infer<typeof notificationPayloadSchema>;