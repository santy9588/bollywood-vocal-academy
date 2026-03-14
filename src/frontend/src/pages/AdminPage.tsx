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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SUBJECTS } from "@/data/subjects";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useIsAdmin } from "@/hooks/useQueries";
import {
  useAddMeetingLink,
  useAllEnrollments,
  useAllLeads,
  useAllMeetingLinks,
  useAllPayments,
  useAllVisitorEvents,
  useConfirmUpiPayment,
  useDeleteMeetingLink,
  useGetRazorpayKeyId,
  useGetUpiConfig,
  useSetRazorpayConfig,
  useSetStripeConfiguration,
  useSetUpiConfig,
} from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  BookOpen,
  CreditCard,
  Loader2,
  Mail,
  Phone,
  Plus,
  Save,
  Settings,
  ShieldAlert,
  Trash2,
  UserCheck,
  Users,
  Video,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type {
  Enrollment,
  Lead,
  MeetingLink,
  PaymentRecord,
  VisitorEvent,
} from "../backend.d";

function formatTs(ts: bigint) {
  return new Date(Number(ts)).toLocaleString("en-IN", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
        style={{ background: `${color}18` }}
      >
        <Icon className="h-6 w-6" style={{ color }} />
      </div>
      <div>
        <p className="font-display text-2xl font-bold" style={{ color }}>
          {value}
        </p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const config =
    status === "completed"
      ? {
          bg: "oklch(0.93 0.08 150)",
          color: "oklch(0.35 0.15 150)",
          label: "Completed",
        }
      : status === "pending-verification"
        ? {
            bg: "oklch(0.96 0.08 80)",
            color: "oklch(0.45 0.15 80)",
            label: "Pending",
          }
        : {
            bg: "oklch(0.95 0.06 25)",
            color: "oklch(0.45 0.15 25)",
            label: status,
          };

  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ background: config.bg, color: config.color }}
    >
      {config.label}
    </span>
  );
}

function MethodBadge({ method }: { method: string }) {
  const config =
    method === "stripe"
      ? {
          bg: "oklch(0.93 0.06 270)",
          color: "oklch(0.40 0.15 270)",
          label: "Stripe",
        }
      : method === "razorpay"
        ? {
            bg: "oklch(0.96 0.06 255)",
            color: "oklch(0.35 0.14 255)",
            label: "Razorpay",
          }
        : method === "upi"
          ? {
              bg: "oklch(0.93 0.06 150)",
              color: "oklch(0.38 0.14 150)",
              label: "UPI",
            }
          : {
              bg: "oklch(0.94 0.02 0)",
              color: "oklch(0.40 0.01 0)",
              label: method,
            };

  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ background: config.bg, color: config.color }}
    >
      {config.label}
    </span>
  );
}

export function AdminPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();

  const { data: visitorEvents, isLoading: eventsLoading } =
    useAllVisitorEvents();
  const { data: leads, isLoading: leadsLoading } = useAllLeads();
  const { data: enrollments, isLoading: enrollmentsLoading } =
    useAllEnrollments();
  const { data: meetingLinks, isLoading: linksLoading } = useAllMeetingLinks();
  const { data: payments, isLoading: paymentsLoading } = useAllPayments();
  const { mutate: addLink, isPending: addingLink } = useAddMeetingLink();
  const { mutate: deleteLink, isPending: deletingLink } =
    useDeleteMeetingLink();
  const { mutate: confirmUpi, isPending: confirmingUpi } =
    useConfirmUpiPayment();

  // Settings queries
  const { data: razorpayKeyId } = useGetRazorpayKeyId();
  const { data: upiConfig } = useGetUpiConfig();
  const { mutate: setRazorpayConfig, isPending: savingRazorpay } =
    useSetRazorpayConfig();
  const { mutate: setUpiConfig, isPending: savingUpi } = useSetUpiConfig();
  const { mutate: setStripeConfig, isPending: savingStripe } =
    useSetStripeConfiguration();

  const [newLink, setNewLink] = useState({
    platform: "",
    url: "",
    subjectId: "",
    title: "",
    scheduledAt: "",
  });

  // Settings form state
  const [razorpayKeyInput, setRazorpayKeyInput] = useState("");
  const [upiIdInput, setUpiIdInput] = useState("");
  const [upiNameInput, setUpiNameInput] = useState("");
  const [stripeKeyInput, setStripeKeyInput] = useState("");

  function handleAddLink(e: React.FormEvent) {
    e.preventDefault();
    if (
      !newLink.platform ||
      !newLink.url ||
      !newLink.subjectId ||
      !newLink.title ||
      !newLink.scheduledAt
    ) {
      toast.error("Please fill all fields.");
      return;
    }
    addLink(
      {
        platform: newLink.platform,
        url: newLink.url,
        subjectId: BigInt(newLink.subjectId),
        title: newLink.title,
        scheduledAt: BigInt(new Date(newLink.scheduledAt).getTime()),
      },
      {
        onSuccess: () => {
          toast.success("Meeting link added.");
          setNewLink({
            platform: "",
            url: "",
            subjectId: "",
            title: "",
            scheduledAt: "",
          });
        },
        onError: () => toast.error("Failed to add meeting link."),
      },
    );
  }

  function handleDeleteLink(linkId: bigint) {
    deleteLink(linkId, {
      onSuccess: () => toast.success("Meeting link deleted."),
      onError: () => toast.error("Failed to delete."),
    });
  }

  function handleConfirmUpi(paymentId: bigint) {
    confirmUpi(paymentId, {
      onSuccess: () =>
        toast.success("UPI payment verified! Enrollment activated."),
      onError: () => toast.error("Failed to verify payment."),
    });
  }

  function handleSaveRazorpay() {
    if (!razorpayKeyInput.trim()) {
      toast.error("Please enter a Razorpay Key ID.");
      return;
    }
    setRazorpayConfig(razorpayKeyInput.trim(), {
      onSuccess: () => {
        toast.success("Razorpay key saved.");
        setRazorpayKeyInput("");
      },
      onError: () => toast.error("Failed to save Razorpay key."),
    });
  }

  function handleSaveUpi() {
    if (!upiIdInput.trim() || !upiNameInput.trim()) {
      toast.error("Please fill both UPI ID and display name.");
      return;
    }
    setUpiConfig(
      { upiId: upiIdInput.trim(), displayName: upiNameInput.trim() },
      {
        onSuccess: () => {
          toast.success("UPI config saved.");
          setUpiIdInput("");
          setUpiNameInput("");
        },
        onError: () => toast.error("Failed to save UPI config."),
      },
    );
  }

  function handleSaveStripe() {
    if (!stripeKeyInput.trim()) {
      toast.error("Please enter a Stripe secret key.");
      return;
    }
    setStripeConfig(
      { secretKey: stripeKeyInput.trim(), allowedCountries: ["IN"] },
      {
        onSuccess: () => {
          toast.success("Stripe key saved.");
          setStripeKeyInput("");
        },
        onError: () => toast.error("Failed to save Stripe key."),
      },
    );
  }

  if (!identity) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <ShieldAlert className="h-12 w-12 text-muted-foreground" />
        <h2 className="font-display text-2xl font-bold">Login Required</h2>
        <p className="text-muted-foreground">
          Please log in to access the admin dashboard.
        </p>
        <Button asChild>
          <Link to="/">Return Home</Link>
        </Button>
      </div>
    );
  }

  if (adminLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-border"
          style={{ borderTopColor: "oklch(0.35 0.12 255)" }}
        />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h2 className="font-display text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground">
          You don't have admin privileges to view this page.
        </p>
        <Button asChild variant="outline">
          <Link to="/">Return Home</Link>
        </Button>
      </div>
    );
  }

  const uniqueSessions = new Set(visitorEvents?.map((e) => e.sessionId)).size;

  return (
    <main className="py-10">
      <div className="container mx-auto px-4">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <ShieldAlert className="h-4 w-4 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground ml-11">
            Manage visitors, leads, enrollments, payments, and live sessions.
          </p>
        </motion.div>

        {/* Stats Row */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Activity}
            label="Unique Sessions"
            value={uniqueSessions}
            color="oklch(0.35 0.12 255)"
          />
          <StatCard
            icon={Users}
            label="Total Leads"
            value={leads?.length ?? 0}
            color="oklch(0.55 0.18 340)"
          />
          <StatCard
            icon={UserCheck}
            label="Enrollments"
            value={enrollments?.length ?? 0}
            color="oklch(0.45 0.15 150)"
          />
          <StatCard
            icon={CreditCard}
            label="Payments"
            value={payments?.length ?? 0}
            color="oklch(0.50 0.15 270)"
          />
        </div>

        <Tabs defaultValue="visitors">
          <TabsList className="mb-6 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger
              value="visitors"
              data-ocid="admin.visitors_tab"
              className="gap-2"
            >
              <Activity className="h-4 w-4" />
              Visitors
            </TabsTrigger>
            <TabsTrigger
              value="leads"
              data-ocid="admin.leads_tab"
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Leads
            </TabsTrigger>
            <TabsTrigger
              value="enrollments"
              data-ocid="admin.enrollments_tab"
              className="gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Enrollments
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              data-ocid="admin.payments_tab"
              className="gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger
              value="meeting-links"
              data-ocid="admin.meeting_links_tab"
              className="gap-2"
            >
              <Video className="h-4 w-4" />
              Meeting Links
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              data-ocid="admin.settings_tab"
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* ── Visitors ──────────────────────────────────── */}
          <TabsContent value="visitors">
            <div className="rounded-2xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="font-display text-lg font-bold">
                  Visitor Events
                </h2>
                <Badge variant="secondary">
                  {visitorEvents?.length ?? 0} events
                </Badge>
              </div>
              {eventsLoading ? (
                <div className="space-y-2 p-5">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : visitorEvents && visitorEvents.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Session ID</TableHead>
                        <TableHead>Page</TableHead>
                        <TableHead>Event Type</TableHead>
                        <TableHead>Scroll Depth</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visitorEvents.map((event: VisitorEvent, i: number) => (
                        <TableRow key={`${event.sessionId}-${i}`}>
                          <TableCell className="font-mono text-xs">
                            {event.sessionId.slice(0, 12)}…
                          </TableCell>
                          <TableCell className="text-sm">
                            {event.page}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {event.eventType}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {event.scrollDepth.toString()}%
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatTs(event.timestamp)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-10 text-center text-muted-foreground">
                  No visitor events yet.
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Leads ─────────────────────────────────────── */}
          <TabsContent value="leads">
            <div className="rounded-2xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="font-display text-lg font-bold">
                  Lead Database
                </h2>
                <Badge variant="secondary">{leads?.length ?? 0} leads</Badge>
              </div>
              {leadsLoading ? (
                <div className="space-y-2 p-5">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : leads && leads.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((lead: Lead, i: number) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: no stable ID on leads
                        <TableRow key={`lead-${i}`}>
                          <TableCell className="font-medium">
                            {lead.name}
                          </TableCell>
                          <TableCell className="text-sm">
                            {lead.phone}
                          </TableCell>
                          <TableCell className="text-sm">
                            {lead.email}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {lead.interestedSubject}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatTs(lead.timestamp)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <a
                                href={`tel:${lead.phone}`}
                                className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                              >
                                <Phone className="h-3 w-3" />
                                Call
                              </a>
                              <a
                                href={`mailto:${lead.email}?subject=Learn Techy — Your Course Enquiry`}
                                className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                              >
                                <Mail className="h-3 w-3" />
                                Email
                              </a>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-10 text-center text-muted-foreground">
                  No leads yet.
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Enrollments ───────────────────────────────── */}
          <TabsContent value="enrollments">
            <div className="rounded-2xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="font-display text-lg font-bold">
                  All Enrollments
                </h2>
                <Badge variant="secondary">
                  {enrollments?.length ?? 0} enrollments
                </Badge>
              </div>
              {enrollmentsLoading ? (
                <div className="space-y-2 p-5">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : enrollments && enrollments.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User Principal</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Payment Ref.</TableHead>
                        <TableHead>Enrolled At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrollments.map((enrollment: Enrollment, i: number) => {
                        const subject = SUBJECTS.find(
                          (s) => s.id === enrollment.subjectId,
                        );
                        return (
                          // biome-ignore lint/suspicious/noArrayIndexKey: no stable ID on enrollments
                          <TableRow key={`enrollment-${i}`}>
                            <TableCell className="font-mono text-xs">
                              {enrollment.user.toString().slice(0, 20)}…
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {subject?.icon}{" "}
                                {subject?.name ??
                                  enrollment.subjectId.toString()}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {enrollment.paymentReference.slice(0, 16)}…
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {formatTs(enrollment.enrolledAt)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-10 text-center text-muted-foreground">
                  No enrollments yet.
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Payments ──────────────────────────────────── */}
          <TabsContent value="payments">
            <div className="rounded-2xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="font-display text-lg font-bold">All Payments</h2>
                <Badge variant="secondary">
                  {payments?.length ?? 0} records
                </Badge>
              </div>
              {paymentsLoading ? (
                <div
                  className="space-y-2 p-5"
                  data-ocid="admin.payments.loading_state"
                >
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : payments && payments.length > 0 ? (
                <div
                  className="overflow-x-auto"
                  data-ocid="admin.payments.table"
                >
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment: PaymentRecord, i: number) => {
                        const subject = SUBJECTS.find(
                          (s) => s.id === payment.subjectId,
                        );
                        const amountInRupees = Math.round(
                          Number(payment.amountInPaise) / 100,
                        );
                        const canVerify =
                          payment.status === "pending-verification" &&
                          payment.method === "upi";

                        return (
                          <TableRow
                            key={payment.id.toString()}
                            data-ocid={`admin.payments.row.${i + 1}`}
                          >
                            <TableCell className="font-mono text-xs">
                              #{payment.id.toString()}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {payment.userId.toString().slice(0, 12)}…
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {subject?.icon}{" "}
                                {subject?.name ?? payment.subjectId.toString()}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <MethodBadge method={payment.method} />
                            </TableCell>
                            <TableCell className="font-semibold text-sm">
                              ₹{amountInRupees}
                            </TableCell>
                            <TableCell>
                              <PaymentStatusBadge status={payment.status} />
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground max-w-24 truncate">
                              {payment.reference.slice(0, 14)}
                              {payment.reference.length > 14 ? "…" : ""}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {formatTs(payment.timestamp)}
                            </TableCell>
                            <TableCell>
                              {canVerify && (
                                <Button
                                  size="sm"
                                  data-ocid={`admin.payment.confirm_button.${i + 1}`}
                                  onClick={() => handleConfirmUpi(payment.id)}
                                  disabled={confirmingUpi}
                                  className="gap-1 text-xs rounded-lg"
                                  style={{
                                    background: "oklch(0.45 0.15 150)",
                                    color: "white",
                                  }}
                                >
                                  {confirmingUpi ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : null}
                                  Verify & Enroll
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div
                  className="p-10 text-center text-muted-foreground"
                  data-ocid="admin.payments.empty_state"
                >
                  No payment records yet.
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Meeting Links ─────────────────────────────── */}
          <TabsContent value="meeting-links">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Existing Links */}
              <div className="rounded-2xl border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <h2 className="font-display text-lg font-bold">
                    All Meeting Links
                  </h2>
                  <Badge variant="secondary">
                    {meetingLinks?.length ?? 0} links
                  </Badge>
                </div>
                {linksLoading ? (
                  <div className="space-y-2 p-5">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                  </div>
                ) : meetingLinks && meetingLinks.length > 0 ? (
                  <div className="divide-y divide-border">
                    {meetingLinks.map((link: MeetingLink, i: number) => {
                      const subject = SUBJECTS.find(
                        (s) => s.id === link.subjectId,
                      );
                      return (
                        <div
                          key={link.id.toString()}
                          className="flex items-start justify-between gap-3 p-4"
                        >
                          <div className="flex flex-col gap-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="shrink-0 text-xs"
                              >
                                {link.platform}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {subject?.name}
                              </span>
                            </div>
                            <p className="truncate text-sm font-medium text-foreground">
                              {link.title}
                            </p>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="truncate text-xs text-primary hover:underline"
                            >
                              {link.url}
                            </a>
                            <p className="text-xs text-muted-foreground">
                              {formatTs(link.scheduledAt)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            data-ocid={`admin.meeting_link.delete_button.${i + 1}`}
                            onClick={() => handleDeleteLink(link.id)}
                            disabled={deletingLink}
                            className="shrink-0 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    No meeting links added yet.
                  </div>
                )}
              </div>

              {/* Add Link Form */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="mb-5 font-display text-lg font-bold">
                  Add Meeting Link
                </h2>
                <form onSubmit={handleAddLink} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Platform *</Label>
                    <Select
                      value={newLink.platform}
                      onValueChange={(v) =>
                        setNewLink((p) => ({ ...p, platform: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Google Meet">Google Meet</SelectItem>
                        <SelectItem value="Zoom">Zoom</SelectItem>
                        <SelectItem value="Microsoft Teams">
                          Microsoft Teams
                        </SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Subject *</Label>
                    <Select
                      value={newLink.subjectId}
                      onValueChange={(v) =>
                        setNewLink((p) => ({ ...p, subjectId: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBJECTS.map((s) => (
                          <SelectItem
                            key={s.id.toString()}
                            value={s.id.toString()}
                          >
                            {s.icon} {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="link-title">Title *</Label>
                    <Input
                      id="link-title"
                      placeholder="e.g. English Grammar Session 3"
                      value={newLink.title}
                      onChange={(e) =>
                        setNewLink((p) => ({ ...p, title: e.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="link-url">Meeting URL *</Label>
                    <Input
                      id="link-url"
                      type="url"
                      placeholder="https://meet.google.com/xxx-xxxx-xxx"
                      value={newLink.url}
                      onChange={(e) =>
                        setNewLink((p) => ({ ...p, url: e.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="link-date">Scheduled At *</Label>
                    <Input
                      id="link-date"
                      type="datetime-local"
                      value={newLink.scheduledAt}
                      onChange={(e) =>
                        setNewLink((p) => ({
                          ...p,
                          scheduledAt: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <Button
                    type="submit"
                    data-ocid="admin.meeting_link.add_button"
                    disabled={addingLink}
                    className="w-full gap-2"
                    style={{
                      background: "oklch(0.35 0.12 255)",
                      color: "white",
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    {addingLink ? "Adding…" : "Add Meeting Link"}
                  </Button>
                </form>
              </div>
            </div>
          </TabsContent>

          {/* ── Settings ──────────────────────────────────── */}
          <TabsContent value="settings">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {/* Stripe Settings Card */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
                    <CreditCard className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-foreground">
                      Stripe
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Card payments gateway
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="stripe-key">Stripe Secret Key</Label>
                    <Input
                      id="stripe-key"
                      type="password"
                      data-ocid="admin.stripe.input"
                      placeholder="sk_live_... or sk_test_..."
                      value={stripeKeyInput}
                      onChange={(e) => setStripeKeyInput(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Starts with <span className="font-mono">sk_live_</span> or{" "}
                      <span className="font-mono">sk_test_</span>
                    </p>
                  </div>
                  <Button
                    data-ocid="admin.stripe.save_button"
                    onClick={handleSaveStripe}
                    disabled={savingStripe}
                    className="w-full gap-2"
                    style={{
                      background: "oklch(0.40 0.15 270)",
                      color: "white",
                    }}
                  >
                    {savingStripe ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {savingStripe ? "Saving…" : "Save Stripe Key"}
                  </Button>
                </div>
              </div>

              {/* Razorpay Settings Card */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                    <span className="text-xl">💳</span>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-foreground">
                      Razorpay
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      UPI, cards & wallets
                    </p>
                  </div>
                </div>

                {razorpayKeyId && (
                  <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
                    ✓ Configured:{" "}
                    <span className="font-mono">
                      {razorpayKeyId.slice(0, 14)}…
                    </span>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="razorpay-key">Razorpay Key ID</Label>
                    <Input
                      id="razorpay-key"
                      data-ocid="admin.razorpay.input"
                      placeholder={
                        razorpayKeyId ?? "rzp_live_... or rzp_test_..."
                      }
                      value={razorpayKeyInput}
                      onChange={(e) => setRazorpayKeyInput(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Starts with <span className="font-mono">rzp_live_</span>{" "}
                      or <span className="font-mono">rzp_test_</span>
                    </p>
                  </div>
                  <Button
                    data-ocid="admin.razorpay.save_button"
                    onClick={handleSaveRazorpay}
                    disabled={savingRazorpay}
                    className="w-full gap-2"
                    style={{
                      background: "oklch(0.35 0.12 255)",
                      color: "white",
                    }}
                  >
                    {savingRazorpay ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {savingRazorpay ? "Saving…" : "Save Razorpay Key"}
                  </Button>
                </div>
              </div>

              {/* UPI Settings Card */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
                    <span className="text-xl">📱</span>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-foreground">
                      UPI
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      PhonePe, GPay, Paytm & more
                    </p>
                  </div>
                </div>

                {upiConfig && (
                  <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700 space-y-0.5">
                    <p>✓ {upiConfig.displayName}</p>
                    <p className="font-mono">{upiConfig.upiId}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="upi-id">UPI ID</Label>
                    <Input
                      id="upi-id"
                      data-ocid="admin.upi.input"
                      placeholder={upiConfig?.upiId ?? "yourname@upi"}
                      value={upiIdInput}
                      onChange={(e) => setUpiIdInput(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="upi-name">Display Name</Label>
                    <Input
                      id="upi-name"
                      placeholder={upiConfig?.displayName ?? "Learn Techy"}
                      value={upiNameInput}
                      onChange={(e) => setUpiNameInput(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Students will see this name on the payment page.
                    </p>
                  </div>
                  <Button
                    data-ocid="admin.upi.save_button"
                    onClick={handleSaveUpi}
                    disabled={savingUpi}
                    className="w-full gap-2"
                    style={{
                      background: "oklch(0.50 0.16 50)",
                      color: "white",
                    }}
                  >
                    {savingUpi ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {savingUpi ? "Saving…" : "Save UPI Config"}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
