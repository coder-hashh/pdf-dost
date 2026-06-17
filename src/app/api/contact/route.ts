import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { contactSchema } from "@/lib/validations"
import { logActivity } from "@/services/activity-logger"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate request body
    const result = contactSchema.safeParse(body)
    if (!result.success) {
      const errorMsg = result.error.issues.map((e: { message: string }) => e.message).join(", ")
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    const { name, email, subject, message } = result.data

    // Save contact message to DB
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email: email.toLowerCase(),
        subject,
        message,
      },
    })

    // Log Activity (guest or user contact submission)
    await logActivity(
      null,
      "submit_contact",
      `Feedback query submitted by ${name} (${email}): "${subject}"`,
      request
    )

    return NextResponse.json(
      { message: "Feedback query sent successfully", id: contactMessage.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Contact Form API error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred sending feedback" },
      { status: 500 }
    )
  }
}
