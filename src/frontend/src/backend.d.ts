import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface PaymentRecord {
    id: bigint;
    status: string;
    method: string;
    userId: Principal;
    reference: string;
    currency: string;
    subjectId: bigint;
    timestamp: Time;
    amountInPaise: bigint;
}
export interface Enrollment {
    paymentMethod: string;
    user: Principal;
    subjectId: bigint;
    enrolledAt: Time;
    paymentReference: string;
    amountInPaise: bigint;
}
export interface VisitorEvent {
    scrollDepth: bigint;
    page: string;
    timestamp: Time;
    sessionId: string;
    eventType: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Lead {
    interestedSubject: string;
    name: string;
    email: string;
    timestamp: Time;
    phone: string;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface MeetingLink {
    id: bigint;
    url: string;
    title: string;
    createdAt: Time;
    platform: string;
    subjectId: bigint;
    scheduledAt: Time;
}
export interface FeeOption {
    id: bigint;
    name: string;
    description: string;
    months: bigint;
    amountInPaise: bigint;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface Subject {
    id: bigint;
    name: string;
    description: string;
}
export interface UserProfile {
    name: string;
}
export interface UpiConfig {
    displayName: string;
    upiId: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMeetingLink(platform: string, url: string, subjectId: bigint, title: string, scheduledAt: Time): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkEnrollment(subjectId: bigint): Promise<boolean>;
    confirmUpiPayment(paymentId: bigint): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    deleteMeetingLink(linkId: bigint): Promise<void>;
    enroll(subjectId: bigint, paymentReference: string, paymentMethod: string, amountInPaise: bigint): Promise<void>;
    getAllEnrollments(): Promise<Array<Enrollment>>;
    getAllLeads(): Promise<Array<Lead>>;
    getAllMeetingLinks(): Promise<Array<MeetingLink>>;
    getAllPayments(): Promise<Array<PaymentRecord>>;
    getAllVisitorEvents(): Promise<Array<VisitorEvent>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFeeOptions(): Promise<Array<FeeOption>>;
    getMeetingLinksForSubject(subjectId: bigint): Promise<Array<MeetingLink>>;
    getMyEnrollments(): Promise<Array<Enrollment>>;
    getMyPayments(): Promise<Array<PaymentRecord>>;
    getRazorpayKeyId(): Promise<string | null>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getStudentMeetingLinks(): Promise<Array<MeetingLink>>;
    getSubjects(): Promise<Array<Subject>>;
    getUpiConfig(): Promise<UpiConfig | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    recordPayment(subjectId: bigint, method: string, amountInPaise: bigint, reference: string): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setRazorpayConfig(keyId: string): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    setUpiConfig(upiId: string, displayName: string): Promise<void>;
    submitLead(name: string, phone: string, email: string, interestedSubject: string): Promise<void>;
    trackVisitor(event: VisitorEvent): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
