import { Newsreader, Hanken_Grotesk } from "next/font/google";
import { defaultMetadata } from "@/lib/seo";
import "./globals.css";

const serif = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-serif-loaded",
  display: "swap",
});
const body = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body-loaded",
  display: "swap",
});

export const metadata = defaultMetadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
