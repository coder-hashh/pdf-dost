import { PrismaClient } from "@prisma/client"
import { unlink, rm } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

const prisma = new PrismaClient()
const STORAGE_BASE = process.env.STORAGE_PATH || path.join(process.cwd(), "storage")

async function main() {
  console.log("Starting cleanup of expired files...")
  const now = new Date()

  try {
    // Find all expired files in DB
    const expiredFiles = await prisma.file.findMany({
      where: {
        expiresAt: { lte: now },
      },
    })

    console.log(`Found ${expiredFiles.length} expired file records in database.`)

    let deletedDiskCount = 0

    for (const file of expiredFiles) {
      if (file.resultPath && existsSync(file.resultPath)) {
        try {
          await unlink(file.resultPath)
          deletedDiskCount++
        } catch (err) {
          console.error(`Failed to delete physical file: ${file.resultPath}`, err)
        }
      }
    }

    // Delete records from DB
    const deleteResult = await prisma.file.deleteMany({
      where: {
        expiresAt: { lte: now },
      },
    })

    console.log(`Successfully deleted ${deleteResult.count} database records and ${deletedDiskCount} physical files.`)
  } catch (error) {
    console.error("Error running expired files cleanup script:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
