import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be at most 50 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must be at most 100 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters").max(200),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must be at most 5000 characters"),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

export const fileUploadSchema = z.object({
  file: z.instanceof(File).refine((file) => file.size <= 50 * 1024 * 1024, {
    message: "File size must be less than 50MB",
  }),
});

export const protectPdfSchema = z.object({
  password: z
    .string()
    .min(4, "Password must be at least 4 characters")
    .max(128, "Password must be at most 128 characters"),
});

export const unlockPdfSchema = z.object({
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password must be at most 128 characters"),
});

export const compressOptionsSchema = z.object({
  level: z.enum(["low", "medium", "high"]),
});

export const splitPdfSchema = z.object({
  pages: z
    .string()
    .min(1, "Please specify pages (e.g., 1-3, 5, 7-9)")
    .regex(
      /^(\d+(-\d+)?)(,\s*\d+(-\d+)?)*$/,
      "Invalid page range format. Use: 1-3, 5, 7-9"
    ),
});

export const rotatePdfSchema = z.object({
  rotation: z.enum(["90", "180", "270"]),
  pages: z.enum(["all", "selected"]),
  selectedPages: z.array(z.number()).optional(),
});

export const htmlToPdfSchema = z.object({
  html: z
    .string()
    .min(1, "HTML content is required")
    .max(1000000, "HTML content is too large"),
  format: z.enum(["A4", "Letter", "Legal"]).default("A4"),
});

export const blogPostSchema = z.object({
  title: z.string().min(5).max(200),
  slug: z
    .string()
    .min(3)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  excerpt: z.string().min(10).max(500),
  content: z.string().min(50),
  coverImage: z.string().url().optional().or(z.literal("")),
  published: z.boolean().default(false),
  authorName: z.string().min(2).max(100),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ProtectPdfInput = z.infer<typeof protectPdfSchema>;
export type UnlockPdfInput = z.infer<typeof unlockPdfSchema>;
export type CompressOptions = z.infer<typeof compressOptionsSchema>;
export type SplitPdfInput = z.infer<typeof splitPdfSchema>;
export type RotatePdfInput = z.infer<typeof rotatePdfSchema>;
export type HtmlToPdfInput = z.infer<typeof htmlToPdfSchema>;
export type BlogPostInput = z.infer<typeof blogPostSchema>;
