import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "GymBuddy",
  description:
    "GymBuddy is your AI-powered fitness companion. Log workouts, track PRs, get personalized coaching, and join creator communities.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <Providers>
          <Navbar />
          <main style={{ flex: 1 }}>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
