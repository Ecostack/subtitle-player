import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Subtitle Player",
  description: "Play your subtitle alongside of a video.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <head>
      <meta name="viewport"
            content="width = device-width, initial-scale = 1.0, minimum-scale = 1, maximum-scale = 1, user-scalable = no"/>
      <link rel="icon" href="/favicon.png"/>
      <title>Subtitle Player</title>
      <meta name="apple-mobile-web-app-title" content="Subtitle Player"/>

      <meta name="apple-mobile-web-app-capable" content="yes"/>

      <meta name="apple-mobile-web-app-status-bar-style" content="black"/>
    </head>
    <body className={inter.className}>{children}</body>
    </html>
  );
}
