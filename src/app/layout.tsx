import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart-Rent KE | Automated M-PESA Rental Management",
  description:
    "The easiest way for Kenyan landlords to collect rent via M-PESA. Automated reminders, instant receipts, and zero reconciliation headaches.",
  keywords: [
    "rent collection Kenya",
    "M-PESA rent",
    "landlord software Kenya",
    "property management Kenya",
    "Smart-Rent KE",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth antialiased">
      <body className={`${inter.className} min-h-full bg-gray-50 text-gray-900`}>
        {children}
      </body>
    </html>
  );
}