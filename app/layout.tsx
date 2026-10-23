import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Endoodle · Enparadigm Illustrations",
  description: "Generate on-brand Enparadigm illustrations with AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
