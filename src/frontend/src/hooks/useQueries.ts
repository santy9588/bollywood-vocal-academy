import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Enrollment,
  FeeOption,
  Lead,
  MeetingLink,
  PaymentRecord,
  ShoppingItem,
  Subject,
  UpiConfig,
  UserProfile,
  VisitorEvent,
} from "../backend.d";
import { useActor } from "./useActor";

// ── Subjects ────────────────────────────────────────────────────────────────

export function useSubjects() {
  const { actor, isFetching } = useActor();
  return useQuery<Subject[]>({
    queryKey: ["subjects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSubjects();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Visitor tracking ─────────────────────────────────────────────────────────

export function useTrackVisitor() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (event: VisitorEvent) => {
      if (!actor) return;
      await actor.trackVisitor(event);
    },
  });
}

// ── Lead submission ───────────────────────────────────────────────────────────

export function useSubmitLead() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      phone: string;
      email: string;
      interestedSubject: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.submitLead(
        data.name,
        data.phone,
        data.email,
        data.interestedSubject,
      );
    },
  });
}

// ── Admin – visitor events ───────────────────────────────────────────────────

export function useAllVisitorEvents() {
  const { actor, isFetching } = useActor();
  return useQuery<VisitorEvent[]>({
    queryKey: ["admin", "visitor-events"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVisitorEvents();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Admin – leads ────────────────────────────────────────────────────────────

export function useAllLeads() {
  const { actor, isFetching } = useActor();
  return useQuery<Lead[]>({
    queryKey: ["admin", "leads"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLeads();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Admin – enrollments ──────────────────────────────────────────────────────

export function useAllEnrollments() {
  const { actor, isFetching } = useActor();
  return useQuery<Enrollment[]>({
    queryKey: ["admin", "enrollments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllEnrollments();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Student – my enrollments ─────────────────────────────────────────────────

export function useMyEnrollments() {
  const { actor, isFetching } = useActor();
  return useQuery<Enrollment[]>({
    queryKey: ["my-enrollments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyEnrollments();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Enrollment check ─────────────────────────────────────────────────────────

export function useCheckEnrollment(subjectId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["enrollment-check", subjectId.toString()],
    queryFn: async () => {
      if (!actor) return false;
      return actor.checkEnrollment(subjectId);
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Enroll mutation ──────────────────────────────────────────────────────────

export function useEnroll() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      subjectId: bigint;
      paymentReference: string;
      paymentMethod: string;
      amountInPaise: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.enroll(
        params.subjectId,
        params.paymentReference,
        params.paymentMethod,
        params.amountInPaise,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-enrollments"] });
      void queryClient.invalidateQueries({ queryKey: ["enrollment-check"] });
    },
  });
}

// ── Meeting links ────────────────────────────────────────────────────────────

export function useMeetingLinksForSubject(subjectId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<MeetingLink[]>({
    queryKey: ["meeting-links", subjectId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMeetingLinksForSubject(subjectId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStudentMeetingLinks() {
  const { actor, isFetching } = useActor();
  return useQuery<MeetingLink[]>({
    queryKey: ["student-meeting-links"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStudentMeetingLinks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllMeetingLinks() {
  const { actor, isFetching } = useActor();
  return useQuery<MeetingLink[]>({
    queryKey: ["admin", "meeting-links"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMeetingLinks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddMeetingLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      platform: string;
      url: string;
      subjectId: bigint;
      title: string;
      scheduledAt: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.addMeetingLink(
        params.platform,
        params.url,
        params.subjectId,
        params.title,
        params.scheduledAt,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admin", "meeting-links"],
      });
      void queryClient.invalidateQueries({ queryKey: ["meeting-links"] });
    },
  });
}

export function useDeleteMeetingLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (linkId: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteMeetingLink(linkId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admin", "meeting-links"],
      });
    },
  });
}

// ── User profile ─────────────────────────────────────────────────────────────

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["my-profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
  });
}

// ── Admin check ──────────────────────────────────────────────────────────────

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["is-admin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Stripe checkout ──────────────────────────────────────────────────────────

export function useCreateCheckoutSession() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (params: {
      items: ShoppingItem[];
      successUrl: string;
      cancelUrl: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createCheckoutSession(
        params.items,
        params.successUrl,
        params.cancelUrl,
      );
    },
  });
}

export function useStripeSessionStatus(sessionId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["stripe-session", sessionId],
    queryFn: async () => {
      if (!actor || !sessionId) return null;
      return actor.getStripeSessionStatus(sessionId);
    },
    enabled: !!actor && !isFetching && !!sessionId,
  });
}

// ── Stripe settings ──────────────────────────────────────────────────────────

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (config: {
      secretKey: string;
      allowedCountries: string[];
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["stripe-configured"] });
    },
  });
}

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["stripe-configured"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Fee options ──────────────────────────────────────────────────────────────

export function useGetFeeOptions() {
  const { actor, isFetching } = useActor();
  return useQuery<FeeOption[]>({
    queryKey: ["fee-options"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeeOptions();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Razorpay ─────────────────────────────────────────────────────────────────

export function useGetRazorpayKeyId() {
  const { actor, isFetching } = useActor();
  return useQuery<string | null>({
    queryKey: ["razorpay-key-id"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getRazorpayKeyId();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetRazorpayConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (keyId: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.setRazorpayConfig(keyId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["razorpay-key-id"] });
    },
  });
}

// ── UPI config ────────────────────────────────────────────────────────────────

export function useGetUpiConfig() {
  const { actor, isFetching } = useActor();
  return useQuery<UpiConfig | null>({
    queryKey: ["upi-config"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUpiConfig();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetUpiConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { upiId: string; displayName: string }) => {
      if (!actor) throw new Error("Not connected");
      await actor.setUpiConfig(params.upiId, params.displayName);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["upi-config"] });
    },
  });
}

// ── Payment records ───────────────────────────────────────────────────────────

export function useRecordPayment() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (params: {
      subjectId: bigint;
      method: string;
      amountInPaise: bigint;
      reference: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.recordPayment(
        params.subjectId,
        params.method,
        params.amountInPaise,
        params.reference,
      );
    },
  });
}

export function useConfirmUpiPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (paymentId: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.confirmUpiPayment(paymentId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "payments"] });
      void queryClient.invalidateQueries({ queryKey: ["my-enrollments"] });
      void queryClient.invalidateQueries({ queryKey: ["enrollment-check"] });
    },
  });
}

export function useAllPayments() {
  const { actor, isFetching } = useActor();
  return useQuery<PaymentRecord[]>({
    queryKey: ["admin", "payments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPayments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyPayments() {
  const { actor, isFetching } = useActor();
  return useQuery<PaymentRecord[]>({
    queryKey: ["my-payments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyPayments();
    },
    enabled: !!actor && !isFetching,
  });
}
