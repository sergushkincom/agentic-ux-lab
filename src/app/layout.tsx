import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

const siteTitle = "Agentic UX Lab";
const siteDescription =
  "Interaction problems in AI and enterprise software, built rather than described.";

export const metadata: Metadata = {
  // Makes the Open Graph image URL absolute, which link previews require.
  metadataBase: new URL("https://agentic-ux-lab.vercel.app"),
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    type: "website",
    siteName: siteTitle,
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col">
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
