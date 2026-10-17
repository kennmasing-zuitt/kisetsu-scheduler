import type { Metadata } from "next";
import StoreProvider from "@/store/StoreProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Boilerplate", template: "%s · Boilerplate" },
  description: "Next.js + Redux + FullCalendar boilerplate",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
