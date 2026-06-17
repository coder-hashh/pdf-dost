import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Read the ${APP_NAME} terms of service to understand the rules and regulations governing use of our platform.`,
};

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: `By accessing or using ${APP_NAME} ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service.

These Terms apply to all visitors, users, and others who access or use the Service. By using the Service, you represent that you are at least 13 years of age.`,
  },
  {
    id: "description",
    title: "2. Description of Service",
    content: `${APP_NAME} provides online PDF processing tools including but not limited to merging, splitting, compressing, converting, rotating, and securing PDF files. The Service may be used with or without creating an account.

We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time without prior notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the Service.`,
  },
  {
    id: "user-accounts",
    title: "3. User Accounts",
    content: `While many tools are available without registration, some features may require an account. When creating an account, you agree to:

- Provide accurate, current, and complete information.
- Maintain the security of your password and accept responsibility for all activities under your account.
- Notify us immediately of any unauthorized use of your account.
- Not create multiple accounts or share account credentials.

We reserve the right to suspend or terminate accounts that violate these Terms.`,
  },
  {
    id: "acceptable-use",
    title: "4. Acceptable Use",
    content: `You agree not to use the Service to:

- Upload, process, or distribute content that is illegal, harmful, threatening, abusive, or otherwise objectionable.
- Violate any applicable laws or regulations.
- Infringe upon intellectual property rights of others.
- Attempt to gain unauthorized access to any part of the Service.
- Use automated scripts, bots, or scrapers to access the Service.
- Overload, damage, or impair the Service infrastructure.
- Use the Service for any commercial purpose without our written consent.

We reserve the right to remove any content that violates these Terms and to terminate access for repeat violators.`,
  },
  {
    id: "file-handling",
    title: "5. File Handling & Storage",
    content: `When you upload files to the Service:

- Files are processed on our secure servers and are automatically deleted within 24 hours.
- We do not claim ownership of any files you upload.
- You are solely responsible for the content of files you upload and ensure you have the right to process them.
- We are not responsible for any loss or corruption of files during processing. Always maintain backup copies of important documents.
- Processed files are available for download for a limited time before automatic deletion.`,
  },
  {
    id: "intellectual-property",
    title: "6. Intellectual Property",
    content: `The Service and its original content (excluding user-uploaded files), features, and functionality are owned by ${APP_NAME} and are protected by international copyright, trademark, and other intellectual property laws.

You may not copy, modify, distribute, sell, or lease any part of our Service or included software, nor may you reverse engineer or attempt to extract the source code of that software.`,
  },
  {
    id: "limitation",
    title: "7. Limitation of Liability",
    content: `The Service is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, either express or implied.

In no event shall ${APP_NAME}, its directors, employees, partners, or suppliers be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses resulting from:

- Your use or inability to use the Service.
- Any unauthorized access to or use of our servers.
- Any errors or omissions in any content.
- Any file corruption or data loss resulting from use of the Service.`,
  },
  {
    id: "termination",
    title: "8. Termination",
    content: `We may terminate or suspend your access to the Service immediately, without prior notice, for any reason whatsoever, including without limitation if you breach the Terms.

Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may do so by contacting us or deleting your account through the settings page.`,
  },
  {
    id: "changes",
    title: "9. Changes to Terms",
    content: `We reserve the right to modify or replace these Terms at any time at our sole discretion. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.

By continuing to access or use the Service after any revisions become effective, you agree to be bound by the revised terms.`,
  },
  {
    id: "governing-law",
    title: "10. Governing Law",
    content: `These Terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions.

Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in San Francisco, California.`,
  },
  {
    id: "contact",
    title: "11. Contact Us",
    content: `If you have any questions about these Terms of Service, please contact us:

- **Email:** legal@pdfguru.com
- **Address:** PDF Dost, San Francisco, CA, USA`,
  },
];

export default function TermsPage() {
  return (
    <div className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="mb-4 text-4xl font-bold tracking-tight">
            Terms of Service
          </h1>
          <p className="text-muted-foreground">
            Last updated: June 1, 2026
          </p>
          <p className="mt-4 text-muted-foreground">
            Please read these Terms of Service carefully before using{" "}
            {APP_NAME}. Your access to and use of the Service is conditioned on
            your acceptance of and compliance with these Terms.
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
