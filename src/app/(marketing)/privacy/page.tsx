import type { Metadata } from "next";
import { APP_NAME, APP_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Read the ${APP_NAME} privacy policy to understand how we handle your data and protect your privacy.`,
};

const sections = [
  {
    id: "information-we-collect",
    title: "1. Information We Collect",
    content: `When you use ${APP_NAME}, we may collect the following types of information:

**Files You Upload:** When you use our PDF tools, you upload files for processing. These files are temporarily stored on our servers only for the duration of the processing and are automatically deleted within 24 hours.

**Account Information:** If you create an account, we collect your name, email address, and encrypted password. Google sign-in users provide their Google profile information.

**Usage Data:** We collect anonymous usage analytics including pages visited, tools used, and general interaction patterns. This helps us improve our services.

**Device Information:** We may collect browser type, operating system, and device type for compatibility and optimization purposes.`,
  },
  {
    id: "how-we-use-information",
    title: "2. How We Use Your Information",
    content: `We use the information we collect to:

- **Provide Services:** Process your PDF files as requested using our tools.
- **Improve Our Platform:** Analyze usage patterns to enhance performance and user experience.
- **Account Management:** Manage your account, preferences, and authentication.
- **Communication:** Send important service updates and respond to support inquiries.
- **Security:** Detect and prevent fraud, abuse, and security incidents.

We never sell your personal information to third parties.`,
  },
  {
    id: "file-security",
    title: "3. File Security & Data Retention",
    content: `Your file security is our top priority:

- **Encryption:** All file transfers use TLS/SSL 256-bit encryption.
- **Auto-Deletion:** Uploaded and processed files are automatically and permanently deleted from our servers within 24 hours.
- **No Access:** Our staff does not access your uploaded files unless required for troubleshooting with your explicit permission.
- **Server Security:** Our servers are protected with enterprise-grade firewalls, intrusion detection systems, and regular security audits.`,
  },
  {
    id: "cookies",
    title: "4. Cookies & Tracking",
    content: `We use cookies and similar technologies for:

- **Essential Cookies:** Required for authentication, session management, and security.
- **Preference Cookies:** Remember your settings like theme preference (dark/light mode).
- **Analytics Cookies:** Help us understand how visitors interact with our website using anonymous, aggregated data.

You can control cookie preferences through your browser settings. Disabling essential cookies may affect platform functionality.`,
  },
  {
    id: "third-party",
    title: "5. Third-Party Services",
    content: `We may use third-party services for:

- **Authentication:** Google OAuth for social sign-in.
- **Analytics:** Anonymous usage analytics to improve our services.
- **Infrastructure:** Cloud hosting providers with strong data protection standards.

These providers have their own privacy policies and are contractually obligated to protect your data.`,
  },
  {
    id: "your-rights",
    title: "6. Your Rights",
    content: `You have the right to:

- **Access:** Request a copy of the personal data we hold about you.
- **Correction:** Update or correct inaccurate personal information.
- **Deletion:** Request deletion of your account and associated data.
- **Data Portability:** Receive your data in a structured, commonly used format.
- **Opt-Out:** Unsubscribe from non-essential communications at any time.

To exercise any of these rights, contact us at privacy@pdfguru.com.`,
  },
  {
    id: "changes",
    title: "7. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. We will notify you of any significant changes by posting the updated policy on this page with a new "Last Updated" date. We encourage you to review this policy periodically.`,
  },
  {
    id: "contact",
    title: "8. Contact Us",
    content: `If you have questions or concerns about this Privacy Policy or our data practices, please contact us:

- **Email:** privacy@pdfguru.com
- **Address:** PDF Dost, San Francisco, CA, USA`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="mb-4 text-4xl font-bold tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            Last updated: June 1, 2026
          </p>
          <p className="mt-4 text-muted-foreground">
            At {APP_NAME}, we take your privacy seriously. This Privacy Policy
            explains how we collect, use, and protect your information when you
            use our services.
          </p>
        </div>

        {/* Table of Contents */}
        <nav className="mb-12 rounded-xl border border-border bg-muted/30 p-6">
          <h2 className="mb-4 text-lg font-semibold">Table of Contents</h2>
          <ol className="space-y-2">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Content */}
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.id} id={section.id}>
              <h2 className="mb-4 text-2xl font-bold">{section.title}</h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground">
                {section.content.split("\n\n").map((paragraph, i) => (
                  <p
                    key={i}
                    className="mb-3 leading-relaxed whitespace-pre-line"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
