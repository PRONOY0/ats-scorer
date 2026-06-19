import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/hooks/useUser";
import Navbar from "@/components/Navbar";
import { GoogleAnalytics } from "@next/third-parties/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ATSS'S",
    template: "%s | ATSS'S",
  },

  description:
    "Analyze resumes, measure ATS compatibility, identify weaknesses, and improve your chances of landing interviews.",

  applicationName: "ATSS'S",

  keywords: [
    "ATS Resume Checker",
    "Resume Scanner",
    "Resume Analysis",
    "ATS Score",
    "Resume Optimization",
    "Job Application",
    "Resume Review",
  ],

  authors: [
    {
      name: "ATSS'S",
    },
  ],

  openGraph: {
    title: "ATSS'S",
    description:
      "AI-powered ATS resume analysis and scoring platform.",
    type: "website",
    siteName: "ATSS'S",
  },

  twitter: {
    card: "summary_large_image",
    title: "ATSS'S",
    description:
      "Analyze resumes and improve ATS compatibility.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-bg-light text-text-main">
        <UserProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </UserProvider>
        <GoogleAnalytics gaId="G-2PPG5S4BLY" />
      </body>
    </html>
  );
}