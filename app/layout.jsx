import "./globals.css";
import AppShell from "@/components/AppShell"
import { getAuthFromCookies } from "@/lib/cookies"

export const metadata = {
  title: "University Magazine Portal",
  description: "University magazine contribution system",
};

export default async function RootLayout({ children }) {
  const session = await getAuthFromCookies()

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#EFE9E1] text-foreground">
        <AppShell session={session}>{children}</AppShell>
      </body>
    </html>
  );
}
