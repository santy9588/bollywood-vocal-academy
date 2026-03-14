import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SUBJECTS } from "@/data/subjects";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

export function SubjectsPage() {
  useVisitorTracking("/subjects");

  return (
    <main className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Badge
            variant="outline"
            className="mb-4 rounded-full px-4 py-1 text-xs font-semibold"
          >
            All Courses
          </Badge>
          <h1 className="font-display text-4xl font-bold tracking-tight lg:text-5xl">
            Explore Our Subjects
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Comprehensive courses designed for real-world success. Enroll today
            for ₹499 per subject.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2">
          {SUBJECTS.map((subject, i) => (
            <motion.div
              key={subject.id.toString()}
              className="group flex flex-col rounded-2xl border border-border bg-card p-8 subject-card-glow card-hover"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="mb-5 flex items-start justify-between">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl"
                  style={{ background: subject.bgColor }}
                >
                  {subject.icon}
                </div>
                <Badge
                  className="rounded-full px-3 py-1 text-sm font-bold"
                  style={{
                    background: `${subject.color}15`,
                    color: subject.color,
                    border: `1px solid ${subject.color}30`,
                  }}
                >
                  ₹{subject.price}
                </Badge>
              </div>

              <h2 className="mb-1 font-display text-2xl font-bold text-foreground">
                {subject.name}
              </h2>
              <p
                className="mb-4 text-sm font-medium"
                style={{ color: subject.color }}
              >
                {subject.tagline}
              </p>
              <p className="mb-6 text-muted-foreground">
                {subject.description}
              </p>

              <ul className="mb-8 grid gap-2 sm:grid-cols-2">
                {subject.syllabus.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{ color: subject.color }}
                    />
                    {item}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className="mt-auto w-full gap-2 rounded-xl font-semibold"
                style={{ background: subject.color, color: "white" }}
              >
                <Link to="/subjects/$id" params={{ id: subject.id.toString() }}>
                  View Course & Enroll
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
