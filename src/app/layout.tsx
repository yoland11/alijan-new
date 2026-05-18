import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "../index.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--app-font-sans",
});

export const metadata: Metadata = {
  title: "مجموعة علي جان",
  description: "منصة مجموعة علي جان للخدمات، المتجر، الطلبات، والإدارة.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
