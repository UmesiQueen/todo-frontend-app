import type { Metadata } from "next";
import { Josefin_Sans} from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const josefin_sans = Josefin_Sans({
  variable: "--font-josefin-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sprint",
  description: "An AI-Powered Sprint Dashboard, a productivity tool designed to help developers track their tasks while leveraging AI to analyze their efficiency.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${josefin_sans.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
