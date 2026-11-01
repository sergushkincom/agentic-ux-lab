import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agentic UX Lab",
  description: "Interaction problems in AI and enterprise software, built rather than described.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
