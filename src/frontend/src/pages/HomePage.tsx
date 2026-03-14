import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUBJECTS } from "@/data/subjects";
import { useSubmitLead } from "@/hooks/useQueries";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Sparkles,
  Star,
  Users,
  Video,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

export function HomePage() {
  const { trackClick } = useVisitorTracking("/");
  const { mutate: submitLead, isPending: isSubmitting } = useSubmitLead();

  const [leadForm, setLeadForm] = useState({
    name: "",
    phone: "",
    email: "",
    interestedSubject: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !leadForm.name ||
      !leadForm.phone ||
      !leadForm.email ||
      !leadForm.interestedSubject
    ) {
      toast.error("Please fill in all fields.");
      return;
    }
    submitLead(leadForm, {
      onSuccess: () => {
        setSubmitted(true);
        toast.success("Thank you! We'll reach out to you soon.");
      },
      onError: () => {
        toast.error("Something went wrong. Please try again.");
      },
    });
    trackClick("lead_form_submit");
  }

  return (
    <main>
      {/* ─── Hero ────────────────────────────────────────────────────── */}
      <section
        data-ocid="home.hero_section"
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.18 0.09 255) 0%, oklch(0.22 0.11 235) 45%, oklch(0.16 0.07 215) 100%)",
        }}
      >
        {/* Decorative circles */}
        <div
          className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, oklch(0.65 0.15 255) 0%, transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/4 h-64 w-64 rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle, oklch(0.78 0.16 80) 0%, transparent 70%)",
          }}
        />

        <div className="container relative mx-auto px-4 py-24 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={0}
              >
                <Badge
                  className="mb-6 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold"
                  style={{
                    background: "oklch(0.78 0.16 80 / 0.2)",
                    color: "oklch(0.88 0.12 80)",
                    border: "1px solid oklch(0.78 0.16 80 / 0.3)",
                  }}
                >
                  <Sparkles className="h-3 w-3" />
                  India's Premier EdTech Platform
                </Badge>
              </motion.div>

              <motion.h1
                className="mb-6 font-display text-5xl font-extrabold leading-[1.1] tracking-tight text-white lg:text-6xl xl:text-7xl"
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={1}
              >
                Learn
                <span
                  className="block"
                  style={{ color: "oklch(0.88 0.16 80)" }}
                >
                  Techy
                </span>
                <span className="block text-3xl font-normal text-white/70 lg:text-4xl">
                  Your Path to Mastery
                </span>
              </motion.h1>

              <motion.p
                className="mb-8 max-w-lg text-lg leading-relaxed text-white/75"
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={2}
              >
                Expert-led courses in English, Singing, Computer Skills, and
                Government Exam Preparation — all in one place. Start your
                transformation today with live sessions and personalised
                guidance.
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-3"
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={3}
              >
                <Button
                  asChild
                  size="lg"
                  className="gap-2 rounded-full px-8 font-semibold text-base shadow-hero"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.78 0.16 75), oklch(0.72 0.18 65))",
                    color: "oklch(0.1 0.04 60)",
                  }}
                  onClick={() => trackClick("explore_subjects")}
                >
                  <Link to="/subjects">
                    Explore Courses
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full border-white/30 bg-white/10 px-8 text-white backdrop-blur-sm hover:bg-white/20"
                  onClick={() => {
                    document
                      .getElementById("lead-capture")
                      ?.scrollIntoView({ behavior: "smooth" });
                    trackClick("get_started");
                  }}
                >
                  Get Started Free
                </Button>
              </motion.div>

              {/* Social proof */}
              <motion.div
                className="mt-10 flex flex-wrap items-center gap-6"
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={4}
              >
                {[
                  { icon: Users, label: "2,400+ Students" },
                  { icon: Star, label: "4.9/5 Rating" },
                  { icon: BookOpenCheck, label: "4 Subjects" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-amber-300" />
                    <span className="text-sm font-medium text-white/80">
                      {label}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Hero image */}
            <motion.div
              className="relative hidden lg:block"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="relative overflow-hidden rounded-2xl shadow-hero">
                <img
                  src="/assets/generated/hero-learn-techy.dim_1600x600.jpg"
                  alt="Learn Techy — Online Education"
                  className="h-80 w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              {/* Floating card */}
              <div
                className="absolute -bottom-6 -left-6 rounded-xl p-4 shadow-card backdrop-blur-sm"
                style={{ background: "oklch(0.98 0.005 250 / 0.95)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Video className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Next Live Class
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      English Grammar — Today 6 PM
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Stats ─────────────────────────────────────────────────────── */}
      <section className="border-b border-border/40 bg-card py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { value: "2,400+", label: "Active Students" },
              { value: "4", label: "Expert Courses" },
              { value: "98%", label: "Success Rate" },
              { value: "₹499", label: "Per Subject" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <p
                  className="font-display text-3xl font-bold lg:text-4xl"
                  style={{ color: "oklch(0.35 0.12 255)" }}
                >
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Subject Cards ──────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge
              variant="outline"
              className="mb-4 rounded-full px-4 py-1 text-xs font-semibold"
            >
              Our Courses
            </Badge>
            <h2 className="font-display text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
              Choose Your Learning Path
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Each course designed by industry experts for real-world success
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SUBJECTS.map((subject, i) => (
              <motion.div
                key={subject.id.toString()}
                data-ocid={`home.subject.card.${i + 1}`}
                className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 subject-card-glow card-hover transition-all"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                {/* Icon */}
                <div
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl text-3xl"
                  style={{ background: subject.bgColor }}
                >
                  {subject.icon}
                </div>

                {/* Badge */}
                <Badge
                  className="mb-3 w-fit rounded-full px-3 py-0.5 text-xs font-semibold"
                  style={{
                    background: `${subject.color}18`,
                    color: subject.color,
                    border: `1px solid ${subject.color}30`,
                  }}
                >
                  ₹{subject.price}
                </Badge>

                <h3 className="mb-2 font-display text-lg font-bold text-foreground">
                  {subject.name}
                </h3>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {subject.tagline}
                </p>

                <ul className="mb-5 space-y-1.5">
                  {subject.syllabus.slice(0, 3).map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs text-muted-foreground"
                    >
                      <CheckCircle2
                        className="mt-0.5 h-3.5 w-3.5 shrink-0"
                        style={{ color: subject.color }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className="mt-auto w-full gap-2 rounded-xl font-semibold transition-all"
                  style={{
                    background: subject.color,
                    color: "white",
                  }}
                  onClick={() => trackClick(`subject_card_${subject.id}`)}
                >
                  <Link
                    to="/subjects/$id"
                    params={{ id: subject.id.toString() }}
                  >
                    Learn More
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ───────────────────────────────────────────────────── */}
      <section
        className="py-20"
        style={{ background: "oklch(0.95 0.02 255 / 0.5)" }}
      >
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: "🎯",
                title: "Expert-Led Live Sessions",
                desc: "Interactive Google Meet & Zoom classes with certified instructors who bring real-world expertise.",
              },
              {
                icon: "📊",
                title: "Progress Tracking",
                desc: "Monitor your learning journey with detailed analytics, mock tests, and performance reports.",
              },
              {
                icon: "💳",
                title: "Secure Payments",
                desc: "Hassle-free enrollment with Stripe-powered secure payment gateway. Start learning in minutes.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                className="rounded-2xl bg-card p-6 shadow-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
              >
                <div className="mb-4 text-4xl">{feature.icon}</div>
                <h3 className="mb-2 font-display text-lg font-bold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Lead Capture ────────────────────────────────────────────────── */}
      <section id="lead-capture" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <motion.div
              className="rounded-3xl border border-border bg-card p-8 shadow-card lg:p-12"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="mb-8 text-center">
                <Badge
                  className="mb-4 rounded-full px-4 py-1 text-xs font-semibold"
                  style={{
                    background: "oklch(0.78 0.16 80 / 0.12)",
                    color: "oklch(0.55 0.14 75)",
                    border: "1px solid oklch(0.78 0.16 80 / 0.25)",
                  }}
                >
                  Free Consultation
                </Badge>
                <h2 className="font-display text-3xl font-bold text-foreground">
                  Start Your Learning Journey
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Fill in your details and our experts will guide you to the
                  right course.
                </p>
              </div>

              {submitted ? (
                <motion.div
                  className="flex flex-col items-center gap-4 py-8 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    You're all set!
                  </h3>
                  <p className="text-muted-foreground">
                    Our team will contact you within 24 hours.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSubmitted(false)}
                    className="mt-2"
                  >
                    Submit Another
                  </Button>
                </motion.div>
              ) : (
                <form
                  ref={formRef}
                  onSubmit={handleLeadSubmit}
                  className="space-y-5"
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="lead-name"
                        className="text-sm font-medium"
                      >
                        Full Name *
                      </Label>
                      <Input
                        id="lead-name"
                        data-ocid="home.lead_capture.input"
                        placeholder="Rahul Sharma"
                        value={leadForm.name}
                        onChange={(e) =>
                          setLeadForm((p) => ({ ...p, name: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="lead-phone"
                        className="text-sm font-medium"
                      >
                        Phone Number *
                      </Label>
                      <Input
                        id="lead-phone"
                        data-ocid="home.lead_capture.input"
                        placeholder="+91 98765 43210"
                        type="tel"
                        value={leadForm.phone}
                        onChange={(e) =>
                          setLeadForm((p) => ({ ...p, phone: e.target.value }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lead-email" className="text-sm font-medium">
                      Email Address *
                    </Label>
                    <Input
                      id="lead-email"
                      data-ocid="home.lead_capture.input"
                      placeholder="rahul@example.com"
                      type="email"
                      value={leadForm.email}
                      onChange={(e) =>
                        setLeadForm((p) => ({ ...p, email: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Interested Subject *
                    </Label>
                    <Select
                      value={leadForm.interestedSubject}
                      onValueChange={(v) =>
                        setLeadForm((p) => ({ ...p, interestedSubject: v }))
                      }
                    >
                      <SelectTrigger data-ocid="home.lead_capture.input">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBJECTS.map((s) => (
                          <SelectItem key={s.id.toString()} value={s.name}>
                            {s.icon} {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    data-ocid="home.lead_capture.submit_button"
                    disabled={isSubmitting}
                    className="w-full rounded-xl py-3 font-semibold text-base"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.35 0.12 255), oklch(0.28 0.1 240))",
                      color: "white",
                    }}
                  >
                    {isSubmitting ? "Submitting…" : "Get Free Consultation →"}
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
