import type { Metadata } from "next";
import { Noto_Sans_SC } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Link from "next/link";
import Disclaimer from "@/components/Disclaimer";

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  adjustFontFallback: false,
  variable: "--font-noto-sans-sc",
});

const GA_MEASUREMENT_ID = 'G-C7BZCD0EHE';

export const metadata: Metadata = {
  title: "每日恐怖故事",
  description: "每天一篇由 AI 生成的短篇恐怖故事",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${notoSansSC.variable} font-sans h-full`}>
      <head>
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `,
          }}
        />
      </head>
      <body className="bg-background text-foreground min-h-full flex flex-col antialiased selection:bg-accent selection:text-white">
        <div className="container mx-auto px-4 pt-6 pb-2">
          <div className="flex justify-between items-center">
            <Link
              href="/"
              className="text-xl text-stone-800 hover:text-stone-600 transition-colors"
            >
              每日恐怖故事
            </Link>
            <Link
              href="/stories"
              className="text-stone-500 hover:text-stone-700 transition-colors"
            >
              往日故事
            </Link>
          </div>
        </div>

        <main className="container mx-auto px-4 py-6 flex-1">{children}</main>

        <footer>
          <Disclaimer />
        </footer>
      </body>
    </html>
  );
}
