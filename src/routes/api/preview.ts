import type { APIEvent } from "@solidjs/start/server";
import chromium from "@sparticuz/chromium";
import puppeteer, { type Browser } from "puppeteer-core";

let browser: Browser | null = null;

export async function GET(event: APIEvent) {
  try {
    const url = new URL(event.request.url);
    url.searchParams.set("ogImage", "true");
    const pageUrl = `${url.origin}${url.search}`;

    if (!browser?.connected) {
      if (
        process.env.NODE_ENV === "production" ||
        process.env.VITE_VERCEL_ENV === "production"
      ) {
        browser = await puppeteer.launch({
          args: [
            ...chromium.args,
            "--disable-dev-shm-usage",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-gpu",
            "--disable-web-security",
            "--disable-features=IsolateOrigins,site-per-process",
            "--disable-site-isolation-trials",
          ],
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
        });
      } else {
        browser = await puppeteer.launch({
          channel: "chrome",
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
      }
    }

    const page = await browser.newPage();

    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });

    await page.goto(pageUrl, {
      waitUntil: "domcontentloaded",
      timeout: 3000,
    });

    const fullScreenshot = await page.screenshot({
      type: "webp",
      quality: 40,
      encoding: "binary",
    });

    const resizePage = await browser.newPage();
    await resizePage.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              background: white;
              width: 1200px;
              height: 630px;
            }
            img {
              max-width: 1200px;
              max-height: 630px;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <img src="data:image/webp;base64,${Buffer.from(fullScreenshot).toString("base64")}" />
        </body>
      </html>
    `);

    await resizePage.setViewport({
      width: 1200,
      height: 630,
      deviceScaleFactor: 1,
    });

    const finalScreenshot = await resizePage.screenshot({
      type: "webp",
      quality: 40,
      encoding: "binary",
    });

    await page.close();
    await resizePage.close();

    return new Response(finalScreenshot, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error generating OG image:", error);
    if (browser) {
      try {
        await browser.close();
        browser = null;
      } catch (closeError) {
        console.error("Error closing browser:", closeError);
      }
    }
    return new Response("Error generating image", { status: 500 });
  }
}
