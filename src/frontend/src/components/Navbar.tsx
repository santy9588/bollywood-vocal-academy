import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useIsAdmin } from "@/hooks/useQueries";
import { Link, useLocation } from "@tanstack/react-router";
import { BookOpen, LogIn, LogOut, Menu, ShieldCheck, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export function Navbar() {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isLoggedIn = !!identity;

  const navLinks = [
    { to: "/", label: "Home", ocid: "nav.home_link" },
    { to: "/subjects", label: "Subjects", ocid: "nav.subjects_link" },
    ...(isLoggedIn
      ? [{ to: "/dashboard", label: "Dashboard", ocid: "nav.dashboard_link" }]
      : []),
    ...(isAdmin
      ? [{ to: "/admin", label: "Admin", ocid: "nav.admin_link" }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-md">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-display text-xl font-bold"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="h-4 w-4" />
          </div>
          <span
            className="hidden sm:block"
            style={{ color: "oklch(0.35 0.12 255)" }}
          >
            Learn<span style={{ color: "oklch(0.78 0.16 80)" }}>Techy</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <li key={link.to}>
                <Link
                  to={link.to}
                  data-ocid={link.ocid}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  } ${link.ocid === "nav.admin_link" ? "flex items-center gap-1" : ""}`}
                >
                  {link.ocid === "nav.admin_link" && (
                    <ShieldCheck className="h-3.5 w-3.5" />
                  )}
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Auth Buttons */}
        <div className="hidden items-center gap-2 md:flex">
          {isLoggedIn ? (
            <Button
              variant="outline"
              size="sm"
              onClick={clear}
              data-ocid="nav.logout_button"
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="nav.login_button"
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <LogIn className="h-4 w-4" />
              {isLoggingIn ? "Logging in…" : "Login"}
            </Button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          className="rounded-md p-2 text-muted-foreground hover:bg-secondary md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-border/40 bg-background md:hidden"
          >
            <div className="container mx-auto flex flex-col gap-1 px-4 py-3">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    data-ocid={link.ocid}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {link.ocid === "nav.admin_link" && (
                      <ShieldCheck className="h-4 w-4" />
                    )}
                    {link.label}
                  </Link>
                );
              })}
              <div className="mt-2 border-t border-border/40 pt-2">
                {isLoggedIn ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      clear();
                      setMobileOpen(false);
                    }}
                    data-ocid="nav.logout_button"
                    className="w-full gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      login();
                      setMobileOpen(false);
                    }}
                    disabled={isLoggingIn}
                    data-ocid="nav.login_button"
                    className="w-full gap-2"
                  >
                    <LogIn className="h-4 w-4" />
                    {isLoggingIn ? "Logging in…" : "Login"}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
