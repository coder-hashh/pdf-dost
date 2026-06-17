import type { LucideIcon } from "lucide-react";
export type Role = "USER" | "ADMIN";
export type FileStatus = "UPLOADING" | "PROCESSING" | "COMPLETED" | "FAILED" | "EXPIRED";


// ===== Tool Types =====
export interface ToolConfig {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  category: "all" | "organize" | "convert" | "edit" | "security";
  acceptedTypes: string[];
  maxFiles: number;
  maxFileSize: number;
}

// ===== File Types =====
export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
  progress: number;
  status: "idle" | "uploading" | "success" | "error";
  error?: string;
}

export interface ProcessedFile {
  id: string;
  originalName: string;
  generatedName: string;
  fileSize: number;
  toolUsed: string;
  status: FileStatus;
  downloadUrl: string;
  createdAt: string;
  expiresAt: string;
}

// ===== API Response Types =====
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ===== User Types =====
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: Role;
  createdAt: string;
}

// ===== Admin Types =====
export interface DashboardStats {
  totalUsers: number;
  totalFiles: number;
  totalProcessed: number;
  storageUsed: number;
  recentActivity: ActivityLogEntry[];
  toolUsageChart: { tool: string; count: number }[];
  userGrowthChart: { date: string; count: number }[];
}

export interface ActivityLogEntry {
  id: string;
  userId: string | null;
  userName: string | null;
  action: string;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

// ===== Blog Types =====
export interface BlogPostPreview {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  authorName: string;
  createdAt: string;
}

export interface BlogPostFull extends BlogPostPreview {
  content: string;
  updatedAt: string;
}

// ===== Contact Types =====
export interface ContactMessageType {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}
