import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { fontSirwan } from "@/public/fonts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sha-caffe",
  description: "Sha-caffe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${fontSirwan.variable} h-full antialiased w-full max-w-full overflow-x-hidden`}>
      <body className="min-h-full flex flex-col font-sirwan w-full max-w-full overflow-x-hidden">{children}</body>
    </html>
  );
}
