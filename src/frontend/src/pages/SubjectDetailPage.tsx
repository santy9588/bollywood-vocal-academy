import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SUBJECTS, getSubjectById } from "@/data/subjects";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useCheckEnrollment,
  useCreateCheckoutSession,
  useEnroll,
  useGetFeeOptions,
  useGetRazorpayKeyId,
  useGetUpiConfig,
  useMeetingLinksForSubject,
  useRecordPayment,
  useStripeSessionStatus,
} from "@/hooks/useQueries";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Lock,
  QrCode,
  ShieldCheck,
  Video,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { FeeOption, MeetingLink } from "../backend.d";

// Razorpay window type extension
interface RazorpayInstance {
  open: () => void;
}

interface RazorpayOpts {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  handler: (response: { razorpay_payment_id: string }) => void;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
}
type RazorpayConstructorType = new (opts: RazorpayOpts) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay: RazorpayConstructorType;
  }
}

function PlatformBadge({ platform }: { platform: string }) {
  const lower = platform.toLowerCase();
  const config = lower.includes("zoom")
    ? {
        label: "Zoom",
        color: "oklch(0.45 0.15 255)",
        bg: "oklch(0.93 0.05 255)",
      }
    : lower.includes("meet")
      ? {
          label: "Google Meet",
          color: "oklch(0.45 0.15 150)",
          bg: "oklch(0.93 0.05 150)",
        }
      : {
          label: platform,
          color: "oklch(0.45 0.12 200)",
          bg: "oklch(0.93 0.04 200)",
        };

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ background: config.bg, color: config.color }}
    >
      {config.label}
    </span>
  );
}

function MeetingCard({ link }: { link: MeetingLink }) {
  const scheduledDate = new Date(Number(link.scheduledAt));
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <PlatformBadge platform={link.platform} />
        </div>
        <h4 className="font-semibold text-foreground">{link.title}</h4>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {scheduledDate.toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </div>
      </div>
      <Button
        asChild
        size="sm"
        className="gap-2 rounded-lg font-semibold"
        style={{
          background: "oklch(0.35 0.12 255)",
          color: "white",
        }}
      >
        <a href={link.url} target="_blank" rel="noopener noreferrer">
          <Video className="h-3.5 w-3.5" />
          Join Meeting
          <ExternalLink className="h-3 w-3" />
        </a>
      </Button>
    </div>
  );
}

function FeeTierCard({
  option,
  selected,
  onSelect,
  accentColor,
}: {
  option: FeeOption;
  selected: boolean;
  onSelect: () => void;
  accentColor: string;
}) {
  const amountInRupees = Math.round(Number(option.amountInPaise) / 100);
  const hasMonths = Number(option.months) > 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full rounded-xl border-2 p-4 text-left transition-all duration-200 hover:shadow-md"
      style={{
        borderColor: selected ? accentColor : "var(--border)",
        background: selected ? `${accentColor}08` : "var(--card)",
      }}
      data-ocid="subject.fee_tier.card"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0"
              style={{ borderColor: selected ? accentColor : "var(--border)" }}
            >
              {selected && (
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ background: accentColor }}
                />
              )}
            </div>
            <span className="font-semibold text-foreground text-sm">
              {option.name}
            </span>
          </div>
          <p className="text-xs text-muted-foreground ml-6">
            {option.description}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p
            className="font-bold text-lg leading-none"
            style={{ color: accentColor }}
          >
            ₹{amountInRupees}
          </p>
          {hasMonths && (
            <p className="text-xs text-muted-foreground mt-0.5">
              ×{Number(option.months)} months
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

export function SubjectDetailPage() {
  const { id } = useParams({ from: "/subjects/$id" });
  const search = useSearch({ from: "/subjects/$id" });
  const navigate = useNavigate();
  const { trackClick } = useVisitorTracking(`/subjects/${id}`);
  const { identity, login } = useInternetIdentity();

  const subjectId = BigInt(id);
  const subjectData = getSubjectById(subjectId) ?? SUBJECTS[0];

  const { data: isEnrolled, isLoading: enrollmentLoading } =
    useCheckEnrollment(subjectId);
  const { data: meetingLinks, isLoading: linksLoading } =
    useMeetingLinksForSubject(subjectId);
  const { mutate: createCheckout, isPending: checkoutPending } =
    useCreateCheckoutSession();
  const { mutate: enroll, isPending: enrollPending } = useEnroll();
  const { data: feeOptions, isLoading: feeLoading } = useGetFeeOptions();
  const { data: razorpayKeyId } = useGetRazorpayKeyId();
  const { data: upiConfig } = useGetUpiConfig();
  const { mutateAsync: recordPayment, isPending: recordingPayment } =
    useRecordPayment();

  const [selectedFeeOption, setSelectedFeeOption] = useState<FeeOption | null>(
    null,
  );
  const [paymentTab, setPaymentTab] = useState("stripe");
  const [utrValue, setUtrValue] = useState("");
  const [upiSubmitted, setUpiSubmitted] = useState(false);
  const razorpayScriptLoaded = useRef(false);

  // Auto-select first fee option when loaded
  useEffect(() => {
    if (feeOptions && feeOptions.length > 0 && !selectedFeeOption) {
      setSelectedFeeOption(feeOptions[0]);
    }
  }, [feeOptions, selectedFeeOption]);

  // Load Razorpay script when tab switches
  useEffect(() => {
    if (paymentTab === "razorpay" && !razorpayScriptLoaded.current) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        razorpayScriptLoaded.current = true;
      };
      document.body.appendChild(script);
    }
  }, [paymentTab]);

  // Handle post-payment success
  const stripeSessionId =
    (search as Record<string, string>)?.session_id ?? null;
  const { data: stripeStatus } = useStripeSessionStatus(stripeSessionId);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional - only fire when stripeStatus changes
  useEffect(() => {
    if (stripeStatus?.__kind__ === "completed" && stripeSessionId) {
      const amount = selectedFeeOption?.amountInPaise ?? 49900n;
      enroll(
        {
          subjectId,
          paymentReference: stripeSessionId,
          paymentMethod: "stripe",
          amountInPaise: amount,
        },
        {
          onSuccess: () => {
            toast.success("Enrollment confirmed! Welcome to the course.");
            void navigate({
              to: "/subjects/$id",
              params: { id },
              search: {},
            });
          },
          onError: () => {
            toast.error(
              "Payment received but enrollment failed. Please contact support.",
            );
          },
        },
      );
    }
  }, [stripeStatus]);

  function handleStripeEnroll() {
    if (!identity) {
      login();
      return;
    }
    const amount = selectedFeeOption?.amountInPaise ?? 49900n;
    const amountInCents = amount; // 1 INR = 100 paise, priceInCents = amountInPaise for INR
    const baseUrl = window.location.origin;
    createCheckout(
      {
        items: [
          {
            productName: `LearnTechy — ${subjectData.name}`,
            productDescription: subjectData.description,
            priceInCents: amountInCents,
            currency: "INR",
            quantity: 1n,
          },
        ],
        successUrl: `${baseUrl}/subjects/${id}?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${baseUrl}/subjects/${id}`,
      },
      {
        onSuccess: (url) => {
          trackClick("checkout");
          window.location.href = url;
        },
        onError: () => {
          toast.error("Could not start checkout. Please try again.");
        },
      },
    );
    trackClick("enroll_now");
  }

  async function handleRazorpayEnroll() {
    if (!identity) {
      login();
      return;
    }
    if (!razorpayKeyId) {
      toast.error("Razorpay is not configured yet.");
      return;
    }
    const amount = selectedFeeOption?.amountInPaise ?? 49900n;
    try {
      const paymentId = await recordPayment({
        subjectId,
        method: "razorpay",
        amountInPaise: amount,
        reference: "pending",
      });

      const rzp = new window.Razorpay({
        key: razorpayKeyId,
        amount: Number(amount),
        currency: "INR",
        name: "Learn Techy",
        description: `${subjectData.name} — ${selectedFeeOption?.name ?? "Course"}`,
        handler: (response: { razorpay_payment_id: string }) => {
          enroll(
            {
              subjectId,
              paymentReference: response.razorpay_payment_id,
              paymentMethod: "razorpay",
              amountInPaise: amount,
            },
            {
              onSuccess: () => {
                toast.success("Payment successful! You are now enrolled.");
              },
              onError: () => {
                toast.error(
                  `Payment received but enrollment failed. Contact support with ID: ${response.razorpay_payment_id}`,
                );
              },
            },
          );
        },
        prefill: { name: "", email: "", contact: "" },
        theme: { color: subjectData.color },
      });
      // suppress unused variable warning
      void paymentId;
      rzp.open();
    } catch {
      toast.error("Could not initiate Razorpay. Please try again.");
    }
  }

  async function handleUpiPayment() {
    if (!identity) {
      login();
      return;
    }
    if (!utrValue.trim()) {
      toast.error("Please enter your UTR / Transaction ID.");
      return;
    }
    const amount = selectedFeeOption?.amountInPaise ?? 49900n;
    try {
      await recordPayment({
        subjectId,
        method: "upi",
        amountInPaise: amount,
        reference: utrValue.trim(),
      });
      setUpiSubmitted(true);
      toast.success(
        "Payment submitted! Admin will verify and activate your enrollment within a few hours.",
      );
    } catch {
      toast.error("Could not submit UPI payment. Please try again.");
    }
  }

  const amountInRupees = selectedFeeOption
    ? Math.round(Number(selectedFeeOption.amountInPaise) / 100)
    : 499;

  return (
    <main className="py-10">
      <div className="container mx-auto px-4">
        {/* Back */}
        <Link
          to="/subjects"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All Subjects
        </Link>

        <div className="grid gap-10 lg:grid-cols-3">
          {/* Left — Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-6 flex items-start gap-4">
                <div
                  className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-5xl"
                  style={{ background: subjectData.bgColor }}
                >
                  {subjectData.icon}
                </div>
                <div>
                  <Badge
                    className="mb-2 rounded-full px-3 py-0.5 text-xs font-semibold"
                    style={{
                      background: `${subjectData.color}15`,
                      color: subjectData.color,
                      border: `1px solid ${subjectData.color}30`,
                    }}
                  >
                    {subjectData.tagline}
                  </Badge>
                  <h1 className="font-display text-4xl font-bold text-foreground">
                    {subjectData.name}
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                    {subjectData.description}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Syllabus */}
            <motion.div
              className="mt-8 rounded-2xl border border-border bg-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="mb-4 font-display text-xl font-bold text-foreground">
                Course Syllabus
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {subjectData.syllabus.map((item, i) => (
                  <motion.li
                    key={item}
                    className="flex items-start gap-2.5 rounded-lg bg-secondary/50 p-3 text-sm"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.06 }}
                  >
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{ color: subjectData.color }}
                    />
                    <span className="text-foreground">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Meeting Links */}
            {isEnrolled && (
              <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                data-ocid="subject.meeting_links.list"
              >
                <h2 className="mb-4 font-display text-xl font-bold text-foreground">
                  Upcoming Live Sessions
                </h2>
                {linksLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-20 w-full rounded-xl" />
                    ))}
                  </div>
                ) : meetingLinks && meetingLinks.length > 0 ? (
                  <div className="space-y-3">
                    {meetingLinks.map((link) => (
                      <MeetingCard key={link.id.toString()} link={link} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-border bg-secondary/30 p-8 text-center">
                    <Video className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No upcoming sessions scheduled yet.
                      <br />
                      Check back soon!
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Right — Enroll Card */}
          <div className="lg:col-span-1">
            <motion.div
              className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {enrollmentLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : isEnrolled ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 rounded-xl bg-green-50 p-4 text-green-700">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <div>
                      <p className="font-semibold">You're Enrolled!</p>
                      <p className="text-sm text-green-600">
                        Access all sessions below.
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="w-full gap-2">
                    <Link to="/dashboard">
                      Go to Dashboard
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Step 1 — Fee Tier Selection */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Step 1 — Choose a Plan
                    </p>
                    {feeLoading ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <Skeleton
                            key={i}
                            className="h-16 w-full rounded-xl"
                          />
                        ))}
                      </div>
                    ) : feeOptions && feeOptions.length > 0 ? (
                      <div
                        className="space-y-2"
                        data-ocid="subject.fee_tier.list"
                      >
                        {feeOptions.map((option) => (
                          <FeeTierCard
                            key={option.id.toString()}
                            option={option}
                            selected={selectedFeeOption?.id === option.id}
                            onSelect={() => setSelectedFeeOption(option)}
                            accentColor={subjectData.color}
                          />
                        ))}
                      </div>
                    ) : (
                      // Fallback if backend returns no options
                      <div className="rounded-xl border-2 border-border p-4">
                        <p className="font-semibold text-foreground">
                          Full Course
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Lifetime access
                        </p>
                        <p
                          className="font-bold text-lg mt-1"
                          style={{ color: subjectData.color }}
                        >
                          ₹499
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Step 2 — Payment Method */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Step 2 — Pay ₹{amountInRupees}
                    </p>

                    <Tabs value={paymentTab} onValueChange={setPaymentTab}>
                      <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger
                          value="stripe"
                          data-ocid="subject.payment.stripe.tab"
                          className="gap-1 text-xs"
                        >
                          <CreditCard className="h-3 w-3" />
                          Stripe
                        </TabsTrigger>
                        <TabsTrigger
                          value="razorpay"
                          data-ocid="subject.payment.razorpay.tab"
                          className="gap-1 text-xs"
                        >
                          💳 Razorpay
                        </TabsTrigger>
                        <TabsTrigger
                          value="upi"
                          data-ocid="subject.payment.upi.tab"
                          className="gap-1 text-xs"
                        >
                          <QrCode className="h-3 w-3" />
                          UPI / QR
                        </TabsTrigger>
                      </TabsList>

                      {/* ── Stripe ──────────────── */}
                      <TabsContent value="stripe">
                        <div className="space-y-3">
                          <ul className="space-y-1.5 text-sm">
                            {[
                              "Live interactive sessions",
                              "Recorded class recordings",
                              "Study materials included",
                              "Certificate on completion",
                            ].map((benefit) => (
                              <li
                                key={benefit}
                                className="flex items-center gap-2"
                              >
                                <CheckCircle2
                                  className="h-3.5 w-3.5 shrink-0"
                                  style={{ color: subjectData.color }}
                                />
                                <span className="text-muted-foreground text-xs">
                                  {benefit}
                                </span>
                              </li>
                            ))}
                          </ul>
                          <Button
                            data-ocid="subject.stripe.primary_button"
                            className="w-full gap-2 rounded-xl py-3 text-base font-semibold"
                            style={{
                              background: subjectData.color,
                              color: "white",
                            }}
                            onClick={handleStripeEnroll}
                            disabled={checkoutPending || !selectedFeeOption}
                          >
                            {checkoutPending ? (
                              "Processing…"
                            ) : !identity ? (
                              <>
                                <Lock className="h-4 w-4" />
                                Login to Enroll
                              </>
                            ) : (
                              `Pay ₹${amountInRupees} via Stripe`
                            )}
                          </Button>
                        </div>
                      </TabsContent>

                      {/* ── Razorpay ─────────────── */}
                      <TabsContent value="razorpay">
                        <div className="space-y-3">
                          {razorpayKeyId === null ? (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                              Razorpay not configured yet. Admin needs to set
                              the Razorpay key in Settings.
                            </div>
                          ) : (
                            <>
                              <p className="text-xs text-muted-foreground">
                                Pay securely via UPI, NetBanking, Wallets, or
                                Cards through Razorpay.
                              </p>
                              <Button
                                data-ocid="subject.razorpay.primary_button"
                                className="w-full gap-2 rounded-xl py-3 text-base font-semibold"
                                style={{
                                  background: "#072654",
                                  color: "white",
                                }}
                                onClick={handleRazorpayEnroll}
                                disabled={
                                  enrollPending ||
                                  recordingPayment ||
                                  !selectedFeeOption
                                }
                              >
                                {enrollPending || recordingPayment ? (
                                  "Processing…"
                                ) : !identity ? (
                                  <>
                                    <Lock className="h-4 w-4" />
                                    Login to Pay
                                  </>
                                ) : (
                                  `Pay ₹${amountInRupees} via Razorpay`
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </TabsContent>

                      {/* ── UPI / QR ─────────────── */}
                      <TabsContent value="upi">
                        <div className="space-y-3">
                          {upiSubmitted ? (
                            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
                              <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-green-600" />
                              <p className="font-semibold text-green-800 text-sm">
                                Payment Submitted!
                              </p>
                              <p className="text-xs text-green-700 mt-1">
                                Admin will verify and activate your enrollment
                                within a few hours.
                              </p>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-center">
                                <img
                                  src="/assets/generated/upi-qr-placeholder.dim_400x440.png"
                                  alt="UPI QR Code — Scan to Pay"
                                  className="w-48 rounded-xl border border-border"
                                />
                              </div>

                              <div className="rounded-xl border border-border bg-secondary/30 p-3 text-center text-sm">
                                {upiConfig ? (
                                  <>
                                    <p className="font-semibold text-foreground">
                                      {upiConfig.displayName}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                                      {upiConfig.upiId}
                                    </p>
                                  </>
                                ) : (
                                  <p className="text-muted-foreground text-xs">
                                    UPI ID will appear here once configured by
                                    admin.
                                  </p>
                                )}
                                <p
                                  className="mt-2 font-bold text-lg"
                                  style={{ color: subjectData.color }}
                                >
                                  Pay ₹{amountInRupees}
                                </p>
                              </div>

                              <div className="space-y-1.5">
                                <Input
                                  data-ocid="subject.upi.input"
                                  placeholder="Enter UTR / Transaction ID after payment"
                                  value={utrValue}
                                  onChange={(e) => setUtrValue(e.target.value)}
                                />
                              </div>

                              <Button
                                data-ocid="subject.upi.primary_button"
                                className="w-full gap-2 rounded-xl font-semibold"
                                style={{
                                  background: upiConfig
                                    ? subjectData.color
                                    : "var(--muted)",
                                  color: upiConfig
                                    ? "white"
                                    : "var(--muted-foreground)",
                                }}
                                onClick={handleUpiPayment}
                                disabled={
                                  recordingPayment ||
                                  !selectedFeeOption ||
                                  !utrValue.trim()
                                }
                              >
                                {recordingPayment ? (
                                  "Submitting…"
                                ) : !identity ? (
                                  <>
                                    <Lock className="h-4 w-4" />
                                    Login to Submit
                                  </>
                                ) : (
                                  "Confirm UPI Payment"
                                )}
                              </Button>

                              <p className="text-center text-xs text-muted-foreground">
                                After admin verification, your course will be
                                activated automatically.
                              </p>
                            </>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  {/* Secure payments note */}
                  <div className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-secondary/30 px-3 py-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Secure payments — Stripe, Razorpay & UPI supported
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
