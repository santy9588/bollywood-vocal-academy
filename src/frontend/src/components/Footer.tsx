import { Link } from "@tanstack/react-router";
import { BookOpen, Heart } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="border-t border-border/60 bg-secondary/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="font-display text-xl font-bold">
                <span style={{ color: "oklch(0.35 0.12 255)" }}>Learn</span>
                <span style={{ color: "oklch(0.78 0.16 80)" }}>Techy</span>
              </span>
            </div>
            <p className="max-w-xs text-sm text-muted-foreground">
              Empowering learners with quality education in English, Singing,
              Computer Skills, and Government Exam Preparation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Courses
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { to: "/subjects/1", label: "English" },
                { to: "/subjects/2", label: "Singing" },
                { to: "/subjects/3", label: "Computer" },
                { to: "/subjects/4", label: "Govt. Exam Prep" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Platform
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/subjects"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  All Subjects
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  My Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border/40 pt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {year} LearnTechy. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            Built with <Heart className="h-3 w-3 fill-current text-red-400" />{" "}
            using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
