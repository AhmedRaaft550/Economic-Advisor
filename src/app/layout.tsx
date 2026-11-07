import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/layout/MainLayout";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { Kufam } from "next/font/google";
import { Cairo } from "next/font/google";
import { ToastT } from "sonner";

const kufam = Kufam({
  subsets: ["latin", "arabic"],
  variable: "--font-kufam",
  weight: ["400", "500", "600"],
  display: "swap",
});

const cairo = Cairo({
  subsets: ["latin", "arabic"],
  variable: "--font-cairo",
  weight: ["300", "400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Personal Economic Advisor",
  description:
    "Secure authentication and dashboard access for the AI personal finance assistant.",
};

export const instant = false;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const currentLocale = await getLocale();
  const isArabic = currentLocale === "ar";
  const global_lang = isArabic ? "ar" : "en";
  const directions = isArabic ? "rtl" : "ltr";

  return (
    <html
      lang={global_lang}
      dir={directions}
      className={`${kufam.variable} ${cairo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          <MainLayout>{children}</MainLayout>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
