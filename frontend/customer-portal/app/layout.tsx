import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CargoHub — India's Smart Cargo Logistics Platform",
  description: "Book cargo transport in seconds. Track your shipment in real-time. Pay securely with Razorpay. Available on Android, iOS, and Web.",
  keywords: ["cargo", "logistics", "transport", "India", "truck booking", "Tata Ace", "Tempo"],
  openGraph: {
    title: "CargoHub — Smart Cargo Logistics",
    description: "Book cargo transport in seconds. Track in real-time.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="grain" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
