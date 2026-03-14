import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { SUBJECTS, getSubjectById } from "@/data/subjects";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useCallerProfile,
  useMyEnrollments,
  useSaveProfile,
  useStudentMeetingLinks,
} from "@/hooks/useQueries";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  Calendar,
  Edit2,
  ExternalLink,
  Save,
  User,
  Video,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { MeetingLink } from "../backend.d";

function PlatformBadge({ platform }: { platform: string }) {
  const lower = platform.toLowerCase();
  if (lower.includes("zoom"))
    return (
      <Badge className="rounded-full bg-blue-100 text-blue-700">Zoom</Badge>
    );
  if (lower.includes("meet"))
    return (
      <Badge className="rounded-full bg-green-100 text-green-700">
        Google Meet
      </Badge>
    );
  return <Badge variant="outline">{platform}</Badge>;
}

export function DashboardPage() {
  useVisitorTracking("/dashboard");
  const { identity, login, isInitializing } = useInternetIdentity();
  const { data: enrollments, isLoading: enrollmentsLoading } =
    useMyEnrollments();
  const { data: meetingLinks, isLoading: linksLoading } =
    useStudentMeetingLinks();
  const { data: profile, isLoading: profileLoading } = useCallerProfile();
  const { mutate: saveProfile, isPending: savingProfile } = useSaveProfile();

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");

  function startEdit() {
    setProfileName(profile?.name ?? "");
    setEditingProfile(true);
  }

  function handleSaveProfile() {
    saveProfile(
      { name: profileName },
      {
        onSuccess: () => {
          toast.success("Profile updated!");
          setEditingProfile(false);
        },
        onError: () => toast.error("Failed to save profile."),
      },
    );
  }

  if (isInitializing) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-border"
          style={{ borderTopColor: "oklch(0.35 0.12 255)" }}
          data-ocid="dashboard.loading_state"
        />
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="rounded-2xl border border-border bg-card p-10 shadow-card">
          <div className="mb-5 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="mb-3 font-display text-2xl font-bold text-foreground">
            Sign In to View Dashboard
          </h2>
          <p className="mb-6 text-muted-foreground">
            Access your enrolled courses, live sessions, and profile.
          </p>
          <Button onClick={login} className="gap-2">
            Login with Internet Identity
          </Button>
        </div>
      </div>
    );
  }

  const principal = identity.getPrincipal().toString();

  return (
    <main className="py-10">
      <div className="container mx-auto px-4">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl font-bold text-foreground">
            My Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Welcome back! Manage your learning journey here.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Enrolled Subjects */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-foreground">
                <BookOpen className="h-5 w-5 text-primary" />
                My Courses
              </h2>

              {enrollmentsLoading ? (
                <div
                  className="grid gap-4 sm:grid-cols-2"
                  data-ocid="dashboard.enrollments_list"
                >
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-28 w-full rounded-xl" />
                  ))}
                </div>
              ) : enrollments && enrollments.length > 0 ? (
                <div
                  className="grid gap-4 sm:grid-cols-2"
                  data-ocid="dashboard.enrollments_list"
                >
                  {enrollments.map((enrollment) => {
                    const subject = getSubjectById(enrollment.subjectId);
                    const data = subject ?? SUBJECTS[0];
                    return (
                      <Link
                        key={enrollment.subjectId.toString()}
                        to="/subjects/$id"
                        params={{ id: enrollment.subjectId.toString() }}
                        className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-card"
                      >
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                          style={{ background: data.bgColor }}
                        >
                          {data.icon}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {data.name}
                          </p>
                          <Badge className="mt-1 rounded-full bg-green-100 text-xs text-green-700">
                            Enrolled
                          </Badge>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(
                              Number(enrollment.enrolledAt),
                            ).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div
                  className="rounded-xl border border-border bg-secondary/30 p-8 text-center"
                  data-ocid="dashboard.enrollments_list"
                >
                  <BookOpen className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="font-medium text-foreground">
                    No courses enrolled yet
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Browse our subjects and start learning today.
                  </p>
                  <Button asChild className="mt-4" size="sm">
                    <Link to="/subjects">Explore Courses</Link>
                  </Button>
                </div>
              )}
            </motion.section>

            {/* Meeting Links */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-foreground">
                <Video className="h-5 w-5 text-primary" />
                Upcoming Live Sessions
              </h2>

              {linksLoading ? (
                <div
                  className="space-y-3"
                  data-ocid="dashboard.meeting_links_list"
                >
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-xl" />
                  ))}
                </div>
              ) : meetingLinks && meetingLinks.length > 0 ? (
                <div
                  className="space-y-3"
                  data-ocid="dashboard.meeting_links_list"
                >
                  {meetingLinks.map((link: MeetingLink) => (
                    <div
                      key={link.id.toString()}
                      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <PlatformBadge platform={link.platform} />
                          <span className="text-xs text-muted-foreground">
                            {getSubjectById(link.subjectId)?.name}
                          </span>
                        </div>
                        <p className="font-semibold text-foreground">
                          {link.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(Number(link.scheduledAt)).toLocaleString(
                            "en-IN",
                            {
                              dateStyle: "medium",
                              timeStyle: "short",
                            },
                          )}
                        </div>
                      </div>
                      <Button
                        asChild
                        size="sm"
                        className="gap-2 shrink-0 rounded-lg font-semibold"
                        style={{
                          background: "oklch(0.35 0.12 255)",
                          color: "white",
                        }}
                      >
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Video className="h-3.5 w-3.5" />
                          Join
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="rounded-xl border border-border bg-secondary/30 p-8 text-center"
                  data-ocid="dashboard.meeting_links_list"
                >
                  <Video className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No upcoming sessions yet. Enroll in a course to get started.
                  </p>
                </div>
              )}
            </motion.section>
          </div>

          {/* Sidebar — Profile */}
          <motion.aside
            className="space-y-6"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-foreground">
                  My Profile
                </h3>
                {!editingProfile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={startEdit}
                    className="gap-1.5 text-xs"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                )}
              </div>

              {/* Avatar */}
              <div className="mb-5 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
                  {profileLoading
                    ? "…"
                    : (profile?.name?.[0] ?? "?").toUpperCase()}
                </div>
              </div>

              {profileLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : editingProfile ? (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="profile-name" className="text-sm">
                      Display Name
                    </Label>
                    <Input
                      id="profile-name"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 gap-1.5"
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                    >
                      <Save className="h-3.5 w-3.5" />
                      {savingProfile ? "Saving…" : "Save"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingProfile(false)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-center">
                  <p className="font-semibold text-foreground">
                    {profile?.name ?? "Anonymous Student"}
                  </p>
                  <p
                    className="break-all text-xs text-muted-foreground"
                    title={principal}
                  >
                    {principal.slice(0, 16)}…{principal.slice(-8)}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Courses Enrolled
                  </span>
                  <Badge variant="secondary" className="font-bold">
                    {enrollments?.length ?? 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Live Sessions
                  </span>
                  <Badge variant="secondary" className="font-bold">
                    {meetingLinks?.length ?? 0}
                  </Badge>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </main>
  );
}
