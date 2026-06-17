import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // 1. Create Default Admin User
  const adminEmail = "admin@pdfguru.com"
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("AdminPassword123!", 10)
    await prisma.user.create({
      data: {
        name: "Admin PDF Dost",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
    })
    console.log("Default Admin User created: admin@pdfguru.com / AdminPassword123!")
  } else {
    console.log("Admin User already exists.")
  }

  // 2. Create Default Blog Posts
  const blogPosts = [
    {
      title: "How to Merge PDF Files in Seconds",
      slug: "how-to-merge-pdf-files",
      excerpt: "Learn the easiest and fastest way to combine multiple PDF documents into a single file online for free.",
      content: `Combining multiple PDF files into one document is one of the most common tasks professionals, students, and businesses face daily. Whether you are assembling reports, merging scanned receipts, or organizing classroom notes, having a reliable PDF merger is essential.

In this guide, we will walk you through how PDF Dost makes it simple to merge files in seconds without installing any proprietary software.

### Step 1: Upload your PDF files
First, navigate to our Merge PDF tool and select the files you want to combine. You can upload up to 20 files at once.

### Step 2: Arrange the pages
Drag and drop the files in the list to reorder them exactly how you want them to appear in the combined document.

### Step 3: Combine and Download
Click the 'Merge' button. Once processing finishes, download your merged file instantly. Our servers automatically encrypt and delete your files after 24 hours to preserve your security.`,
      coverImage: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop",
      published: true,
      authorName: "Admin Guru",
    },
    {
      title: "Why PDF Compression is Crucial for Web Uploads",
      slug: "why-pdf-compression-is-crucial",
      excerpt: "Find out why reducing your PDF file size helps improve loading times, saves bandwidth, and meets upload restrictions.",
      content: `Many government exam boards, job application portals, and academic portals enforce strict file size limits on PDF uploads, often capping files at 2MB or less. If your scanned document is 15MB, how do you shrink it without losing readability?

This is where PDF compression becomes vital. In this article, we explain how compression algorithms work and how you can use PDF Dost to optimize your files.

### The Problem with Large PDFs
High-resolution scans and image-heavy PDF reports can quickly balloon in file size. They consume local disk storage, take longer to send via email, and often fail to upload on official websites.

### How Compression Works
PDF Dost offers three levels of compression:
1. **Low Compression (Best Quality):** Slightly reduces resolution, keeping images crisp. Best for print.
2. **Medium Compression (Balanced):** The perfect compromise for web sharing. Reduces size by up to 70% with negligible loss.
3. **High Compression (Smallest Size):** Compresses files to their absolute minimum. Ideal for email uploads where space is tight.

Navigate to our Compress PDF tool, select your compression preference, and optimize your document size in seconds!`,
      coverImage: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop",
      published: true,
      authorName: "Admin Guru",
    },
  ]

  for (const post of blogPosts) {
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug: post.slug },
    })

    if (!existingPost) {
      await prisma.blogPost.create({
        data: post,
      })
      console.log(`Blog post seeded: ${post.title}`)
    } else {
      console.log(`Blog post "${post.title}" already exists.`)
    }
  }

  console.log("Database seeding finished!")
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
