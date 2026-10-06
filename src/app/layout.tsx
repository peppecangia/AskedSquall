import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Compagno D&D",
  description: "Schede personaggio e strumenti per 3.5e e 5e, local-first.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className="dark h-full antialiased" style={{ colorScheme: "dark" }}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
