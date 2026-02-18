import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solana Agent SDK · Dashboard",
  description:
    "Live visualization of autonomous Solana agents — portfolio tracking, yield scouting, and risk monitoring.",
  openGraph: {
    title: "Solana Agent SDK Dashboard",
    description: "Real-time agent monitoring for the Solana blockchain",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
