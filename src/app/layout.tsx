import type { Metadata } from "next";
import { Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Disclaimer from "@/components/Disclaimer";

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  variable: "--font-noto-sans-sc",
});

export const metadata: Metadata = {
  title: "每日恐怖小说",
  description: "每天一篇由 AI 生成的短篇恐怖小说",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${notoSansSC.variable} font-sans h-full`}>
      <body className="bg-background text-foreground min-h-full flex flex-col antialiased selection:bg-accent selection:text-white">
        <div className="container mx-auto px-4 pt-6 pb-2">
          <div className="flex justify-between items-center">
            <Link
              href="/"
              className="text-xl text-stone-800 hover:text-stone-600 transition-colors"
            >
              每日恐怖小说
            </Link>
            <Link
              href="/stories"
              className="text-stone-500 hover:text-stone-700 transition-colors"
            >
              往日故事
            </Link>
          </div>
        </div>

        <main className="container mx-auto px-4 py-6 flex-1">
          {children}
        </main>

        <footer>
          <Disclaimer />
        </footer>
      </body>
    </html>
  );
}
