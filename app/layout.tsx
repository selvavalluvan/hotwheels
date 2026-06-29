import type { Metadata, Viewport } from "next";
import { Saira, Saira_Condensed } from "next/font/google";
import "./globals.css";

const saira = Saira({
  variable: "--font-saira",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const sairaCondensed = Saira_Condensed({
  variable: "--font-saira-condensed",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Hot Wheels Inventory",
  description: "Scan and track your Hot Wheels die-cast collection",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#E3000F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${saira.variable} ${sairaCondensed.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white font-sans text-[#14110F]">
        {children}
      </body>
    </html>
  );
}
