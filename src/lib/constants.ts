import {
  FileText,
  Scissors,
  Minimize2,
  RotateCw,
  Lock,
  Unlock,
  Image,
  FileImage,
  FileType,
  Table,
  Sheet,
  Monitor,
  Code,
  Presentation,
  Merge,
  type LucideIcon,
} from "lucide-react";

export interface Tool {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  category: ToolCategory;
  acceptedTypes: string[];
  maxFiles: number;
  maxFileSize: number; // in bytes
}

export type ToolCategory = "all" | "organize" | "convert" | "edit" | "security";

export const TOOL_CATEGORIES: { id: ToolCategory; label: string }[] = [
  { id: "all", label: "All Tools" },
  { id: "organize", label: "Organize" },
  { id: "convert", label: "Convert" },
  { id: "edit", label: "Edit" },
  { id: "security", label: "Security" },
];

export const TOOLS: Tool[] = [
  {
    id: "merge-pdf",
    slug: "merge-pdf",
    title: "Merge PDF",
    description: "Combine multiple PDFs into one file",
    longDescription:
      "Merge multiple PDF files into a single document. Drag and drop to reorder pages before combining.",
    icon: Merge,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    category: "organize",
    acceptedTypes: [".pdf", "application/pdf"],
    maxFiles: 20,
    maxFileSize: 50 * 1024 * 1024,
  },
  {
    id: "split-pdf",
    slug: "split-pdf",
    title: "Split PDF",
    description: "Extract pages from a PDF document",
    longDescription:
      "Split a PDF into separate files by selecting specific pages or page ranges.",
    icon: Scissors,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    category: "organize",
    acceptedTypes: [".pdf", "application/pdf"],
    maxFiles: 1,
    maxFileSize: 50 * 1024 * 1024,
  },
  {
    id: "compress-pdf",
    slug: "compress-pdf",
    title: "Compress PDF",
    description: "Reduce PDF file size",
    longDescription:
      "Compress your PDF files to reduce their size while maintaining quality. Choose from low, medium, or high compression.",
    icon: Minimize2,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    category: "edit",
    acceptedTypes: [".pdf", "application/pdf"],
    maxFiles: 1,
    maxFileSize: 50 * 1024 * 1024,
  },
  {
    id: "rotate-pdf",
    slug: "rotate-pdf",
    title: "Rotate PDF",
    description: "Rotate PDF pages to any angle",
    longDescription:
      "Rotate individual pages or all pages in your PDF. Preview changes before downloading.",
    icon: RotateCw,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    category: "edit",
    acceptedTypes: [".pdf", "application/pdf"],
    maxFiles: 1,
    maxFileSize: 50 * 1024 * 1024,
  },
  {
    id: "protect-pdf",
    slug: "protect-pdf",
    title: "Protect PDF",
    description: "Add password protection to PDF",
    longDescription:
      "Secure your PDF files with password encryption using AES-256 bit security.",
    icon: Lock,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    category: "security",
    acceptedTypes: [".pdf", "application/pdf"],
    maxFiles: 1,
    maxFileSize: 50 * 1024 * 1024,
  },
  {
    id: "unlock-pdf",
    slug: "unlock-pdf",
    title: "Unlock PDF",
    description: "Remove password from PDF",
    longDescription:
      "Remove password protection from your PDF files. You'll need to provide the current password.",
    icon: Unlock,
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
    category: "security",
    acceptedTypes: [".pdf", "application/pdf"],
    maxFiles: 1,
    maxFileSize: 50 * 1024 * 1024,
  },
  {
    id: "jpg-to-pdf",
    slug: "jpg-to-pdf",
    title: "JPG to PDF",
    description: "Convert images to PDF document",
    longDescription:
      "Convert JPG, PNG, and other image files to a single PDF document. Rearrange images before conversion.",
    icon: Image,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    category: "convert",
    acceptedTypes: [".jpg", ".jpeg", ".png", ".webp", "image/jpeg", "image/png", "image/webp"],
    maxFiles: 20,
    maxFileSize: 20 * 1024 * 1024,
  },
  {
    id: "pdf-to-jpg",
    slug: "pdf-to-jpg",
    title: "PDF to JPG",
    description: "Convert PDF pages to images",
    longDescription:
      "Extract each page of your PDF as a high-quality JPG image. Download individual images or all at once.",
    icon: FileImage,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    category: "convert",
    acceptedTypes: [".pdf", "application/pdf"],
    maxFiles: 1,
    maxFileSize: 50 * 1024 * 1024,
  },
  {
    id: "word-to-pdf",
    slug: "word-to-pdf",
    title: "Word to PDF",
    description: "Convert DOCX to PDF format",
    longDescription:
      "Convert Microsoft Word documents (.docx) to PDF format while preserving formatting and layout.",
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-600/10",
    category: "convert",
    acceptedTypes: [".docx", ".doc", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    maxFiles: 1,
    maxFileSize: 50 * 1024 * 1024,
  },
  {
    id: "pdf-to-word",
    slug: "pdf-to-word",
    title: "PDF to Word",
    description: "Convert PDF to editable DOCX",
    longDescription:
      "Convert your PDF files to editable Microsoft Word documents (.docx).",
    icon: FileType,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    category: "convert",
    acceptedTypes: [".pdf", "application/pdf"],
    maxFiles: 1,
    maxFileSize: 50 * 1024 * 1024,
  },
  {
    id: "excel-to-pdf",
    slug: "excel-to-pdf",
    title: "Excel to PDF",
    description: "Convert XLSX to PDF format",
    longDescription:
      "Convert Microsoft Excel spreadsheets (.xlsx) to PDF format.",
    icon: Table,
    color: "text-green-600",
    bgColor: "bg-green-600/10",
    category: "convert",
    acceptedTypes: [".xlsx", ".xls", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
    maxFiles: 1,
    maxFileSize: 50 * 1024 * 1024,
  },
  {
    id: "pdf-to-excel",
    slug: "pdf-to-excel",
    title: "PDF to Excel",
    description: "Convert PDF tables to XLSX",
    longDescription:
      "Extract tables from your PDF and convert them to editable Excel spreadsheets (.xlsx).",
    icon: Sheet,
    color: "text-emerald-600",
    bgColor: "bg-emerald-600/10",
    category: "convert",
    acceptedTypes: [".pdf", "application/pdf"],
    maxFiles: 1,
    maxFileSize: 50 * 1024 * 1024,
  },
  {
    id: "powerpoint-to-pdf",
    slug: "powerpoint-to-pdf",
    title: "PowerPoint to PDF",
    description: "Convert PPTX to PDF format",
    longDescription:
      "Convert Microsoft PowerPoint presentations (.pptx) to PDF format.",
    icon: Presentation,
    color: "text-orange-600",
    bgColor: "bg-orange-600/10",
    category: "convert",
    acceptedTypes: [".pptx", ".ppt", "application/vnd.openxmlformats-officedocument.presentationml.presentation"],
    maxFiles: 1,
    maxFileSize: 50 * 1024 * 1024,
  },
  {
    id: "pdf-to-powerpoint",
    slug: "pdf-to-powerpoint",
    title: "PDF to PowerPoint",
    description: "Convert PDF to editable PPTX",
    longDescription:
      "Convert your PDF files to editable PowerPoint presentations (.pptx).",
    icon: Monitor,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    category: "convert",
    acceptedTypes: [".pdf", "application/pdf"],
    maxFiles: 1,
    maxFileSize: 50 * 1024 * 1024,
  },
  {
    id: "html-to-pdf",
    slug: "html-to-pdf",
    title: "HTML to PDF",
    description: "Generate PDF from HTML content",
    longDescription:
      "Convert HTML content or web pages into professional PDF documents using a headless browser.",
    icon: Code,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    category: "convert",
    acceptedTypes: [".html", ".htm", "text/html"],
    maxFiles: 1,
    maxFileSize: 10 * 1024 * 1024,
  },
];

export const APP_NAME = "PDF Dost";
export const APP_DESCRIPTION =
  "Your Complete PDF Solution — Merge, Split, Compress, Convert, Edit, and Protect PDF Files Online for Free.";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const FILE_EXPIRY_HOURS = 24;

export const NAV_LINKS = [
  { label: "Tools", href: "/tools" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];
