import puppeteer from "puppeteer";

interface HtmlToPdfOptions {
  format: string;
}

/**
 * Convert HTML content to a PDF document.
 * Uses Puppeteer if available, otherwise returns an error.
 * @param html - HTML content to convert
 * @param options - Conversion options including page format
 * @returns A buffer containing the generated PDF
 */
export async function htmlToPdf(
  html: string,
  options: HtmlToPdfOptions
): Promise<Buffer> {

  const args = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--no-first-run",
    "--no-zygote",
  ];

  if (process.platform !== "win32") {
    args.push("--single-process");
  }

  const browser = await puppeteer.launch({
    headless: true,
    args,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  });

  try {
    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "load",
      timeout: 30_000,
    });

    const pdfBuffer = await page.pdf({
      format: options.format as "A4" | "Letter" | "Legal",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "15mm",
        bottom: "20mm",
        left: "15mm",
      },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
