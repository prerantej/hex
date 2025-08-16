import "./globals.css";
import Link from "next/link";
import { ReactNode } from "react";
import dynamic from "next/dynamic";
import { Inter } from "next/font/google";
import { auth } from "../src/lib/auth";

// client components (no SSR)
const ThemeToggle = dynamic(() => import("../components/ThemeToggle"), { ssr: false });
const UserNav = dynamic(() => import("../components/UserNav"), { ssr: false });

// Wrap with ThemeProvider to enable .dark on <html>
import ThemeProvider from "../components/ThemeProvider";

export const metadata = {
  title: "Hex – Campus Placement Review",
  description: "Anonymous placement journeys for a single college",
};

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const user = (session?.user as any) || null;
  const isLoggedIn = Boolean(user?.id);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <header className="border-b border-border bg-card/70 backdrop-blur">
            <div className="container flex items-center justify-between h-14">
              <Link
                href="/"
                className="flex items-center gap-2 font-semibold tracking-tight"
                aria-label="HEX Home"
              >
                {/* Luminent hex logo */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-6 h-6 text-indigo-500 drop-shadow-glow animate-pulse"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M21 16.5V7.5L12 2 3 7.5v9L12 22l9-5.5Z" />
                </svg>
                <span className="uppercase">HEX</span>
              </Link>

              <nav className="flex items-center gap-3 text-sm">
                <Link href="/companies" className="btn-secondary">Companies</Link>
                <Link href="/submit" className="btn-secondary">Submit</Link>

                <ThemeToggle />

                {!isLoggedIn ? (
                  <>
                    <Link href="/login" className="btn-secondary">Login</Link>
                    <Link href="/signup" className="btn">Sign up</Link>
                  </>
                ) : (
                  <UserNav handle={user?.handle ?? user?.name} role={user?.role} />
                )}
              </nav>
            </div>
          </header>

          <main className="container py-6">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
