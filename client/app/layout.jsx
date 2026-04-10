import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { LostItemPrompt } from "@/components/LostItemPrompt";
import { Shell } from "@/components/Shell";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Shoffr Lite",
  description: "The gold standard of rides — lightweight demo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-screen font-sans pb-24">
        <AuthProvider>
          <Shell>{children}</Shell>
          <LostItemPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}
