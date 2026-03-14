import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Initialize access control system with roles
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Stripe configuration
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  // Razorpay & UPI configs
  public type RazorpayConfig = {
    keyId : Text;
  };
  var razorpayConfig : ?RazorpayConfig = null;

  public type UpiConfig = {
    upiId : Text;
    displayName : Text;
  };
  var upiConfig : ?UpiConfig = null;

  // Payment & Fee types
  public type PaymentRecord = {
    id : Nat;
    userId : Principal;
    subjectId : Nat;
    method : Text;
    amountInPaise : Nat;
    currency : Text;
    status : Text;
    reference : Text;
    timestamp : Time.Time;
  };

  public type FeeOption = {
    id : Nat;
    name : Text;
    description : Text;
    amountInPaise : Nat;
    months : Nat;
  };

  // Custom types
  public type UserProfile = {
    name : Text;
  };

  public type VisitorEvent = {
    sessionId : Text;
    page : Text;
    eventType : Text;
    scrollDepth : Nat;
    timestamp : Time.Time;
  };

  public type Lead = {
    name : Text;
    phone : Text;
    email : Text;
    interestedSubject : Text;
    timestamp : Time.Time;
  };

  public type Subject = {
    id : Nat;
    name : Text;
    description : Text;
  };

  public type Enrollment = {
    user : Principal;
    subjectId : Nat;
    paymentReference : Text;
    paymentMethod : Text;
    amountInPaise : Nat;
    enrolledAt : Time.Time;
  };

  public type MeetingLink = {
    id : Nat;
    platform : Text;
    url : Text;
    subjectId : Nat;
    title : Text;
    scheduledAt : Time.Time;
    createdAt : Time.Time;
  };

  // Subjects are fixed
  let subjects = [
    {
      id = 1;
      name = "English";
      description = "Learn English skills";
    },
    {
      id = 2;
      name = "Singing";
      description = "Singing lessons for all levels";
    },
    {
      id = 3;
      name = "Computer";
      description = "Computer skills and programming";
    },
    {
      id = 4;
      name = "Government Exam Preparation";
      description = "Prepare for government job exams";
    },
  ];

  // Storage
  let userProfiles = Map.empty<Principal, UserProfile>();
  let visitors = Map.empty<Text, VisitorEvent>();
  let leads = Map.empty<Nat, Lead>();
  let enrollments = Map.empty<Principal, [Enrollment]>();
  let meetingLinks = Map.empty<Nat, MeetingLink>();
  let payments = Map.empty<Nat, PaymentRecord>();

  // Counter for auto-increment IDs
  var leadIdCounter = 0;
  var meetingLinkIdCounter = 0;
  var paymentIdCounter = 0;

  // Stripe integration (Required methods)
  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can configure Stripe");
    };
    stripeConfig := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe not configured yet") };
      case (?c) { c };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Razorpay & UPI config methods
  public shared ({ caller }) func setRazorpayConfig(keyId : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can set Razorpay config");
    };
    razorpayConfig := ?{ keyId };
  };

  public shared ({ caller }) func setUpiConfig(upiId : Text, displayName : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can set UPI config");
    };
    upiConfig := ?{ upiId; displayName };
  };

  public query func getRazorpayKeyId() : async ?Text {
    switch (razorpayConfig) {
      case (null) { null };
      case (?config) { ?config.keyId };
    };
  };

  public query func getUpiConfig() : async ?UpiConfig {
    upiConfig;
  };

  // Fee options (fixed)
  public query func getFeeOptions() : async [FeeOption] {
    [
      {
        id = 1;
        name = "Full Course";
        description = "Access entire course - one-time payment";
        amountInPaise = 49900;
        months = 0;
      },
      {
        id = 2;
        name = "Monthly Plan";
        description = "Pay monthly - 3 months";
        amountInPaise = 19900;
        months = 3;
      },
      {
        id = 3;
        name = "Group/Family";
        description = "Multiple enrollments - discounted";
        amountInPaise = 89900;
        months = 0;
      },
    ];
  };

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Visitor tracking - Public, no authentication required
  public shared ({ caller }) func trackVisitor(event : VisitorEvent) : async () {
    // No authorization check - visitors (guests) can track events
    visitors.add(event.sessionId, event);
  };

  public query ({ caller }) func getAllVisitorEvents() : async [VisitorEvent] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all visitor events");
    };
    visitors.values().toArray();
  };

  // Lead management - Public submission, admin viewing
  public shared ({ caller }) func submitLead(name : Text, phone : Text, email : Text, interestedSubject : Text) : async () {
    // No authorization check - public can submit leads
    let lead : Lead = {
      name;
      phone;
      email;
      interestedSubject;
      timestamp = Time.now();
    };
    leads.add(leadIdCounter, lead);
    leadIdCounter += 1;
  };

  public query ({ caller }) func getAllLeads() : async [Lead] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all leads");
    };
    leads.values().toArray();
  };

  // Subject management - Public viewing
  public query ({ caller }) func getSubjects() : async [Subject] {
    // No authorization check - public can view subjects
    subjects;
  };

  // Enrollment management - Authenticated users only
  public shared ({ caller }) func enroll(subjectId : Nat, paymentReference : Text, paymentMethod : Text, amountInPaise : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can enroll");
    };

    // Validate subject exists
    let matchingSubjects = subjects.filter(func(sub) { sub.id == subjectId });
    if (matchingSubjects.size() <= 0) {
      Runtime.trap("Invalid subjectId " # subjectId.toText());
    };

    let newEnrollment : Enrollment = {
      user = caller;
      subjectId;
      paymentReference;
      paymentMethod;
      amountInPaise;
      enrolledAt = Time.now();
    };

    let userEnrollments = switch (enrollments.get(caller)) {
      case (null) { [newEnrollment] };
      case (?existingEnr) { existingEnr.concat([newEnrollment]) };
    };

    enrollments.add(caller, userEnrollments);
  };

  public query ({ caller }) func getMyEnrollments() : async [Enrollment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view enrollments");
    };
    switch (enrollments.get(caller)) {
      case (null) { [] };
      case (?enr) { enr };
    };
  };

  public query ({ caller }) func getAllEnrollments() : async [Enrollment] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all enrollments");
    };

    // Collect all enrollments from all users
    var allEnrollments : [Enrollment] = [];
    for (userEnrollments in enrollments.values()) {
      allEnrollments := allEnrollments.concat(userEnrollments);
    };
    allEnrollments;
  };

  // Meeting link management - Admin creates, enrolled users view
  public shared ({ caller }) func addMeetingLink(platform : Text, url : Text, subjectId : Nat, title : Text, scheduledAt : Time.Time) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add meeting links");
    };

    let link : MeetingLink = {
      id = meetingLinkIdCounter;
      platform;
      url;
      subjectId;
      title;
      scheduledAt;
      createdAt = Time.now();
    };

    meetingLinks.add(meetingLinkIdCounter, link);
    meetingLinkIdCounter += 1;
  };

  public query ({ caller }) func getMeetingLinksForSubject(subjectId : Nat) : async [MeetingLink] {
    // Check if user is enrolled in the subject or is admin
    let myEnrollments = switch (enrollments.get(caller)) {
      case (null) { [] };
      case (?enr) { enr };
    };

    let hasEnrollment = myEnrollments.filter(func(enr) { enr.subjectId == subjectId }).size() > 0;

    if (not hasEnrollment and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: You must be enrolled in this subject to view meeting links");
    };

    meetingLinks.values().toArray().filter(
      func(link) { link.subjectId == subjectId }
    );
  };

  public query ({ caller }) func getAllMeetingLinks() : async [MeetingLink] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all meeting links");
    };

    meetingLinks.values().toArray();
  };

  public shared ({ caller }) func deleteMeetingLink(linkId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete meeting links");
    };

    switch (meetingLinks.get(linkId)) {
      case (null) { Runtime.trap("Invalid meeting link id") };
      case (?_) {
        meetingLinks.remove(linkId);
      };
    };
  };

  // Helper functions
  public query ({ caller }) func checkEnrollment(subjectId : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check enrollment");
    };

    switch (enrollments.get(caller)) {
      case (null) { false };
      case (?enr) {
        let filteredEnrollments = enr.filter(func(e) { e.subjectId == subjectId });
        filteredEnrollments.size() > 0;
      };
    };
  };

  public query ({ caller }) func getStudentMeetingLinks() : async [MeetingLink] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view meeting links");
    };

    let myEnrollments = switch (enrollments.get(caller)) {
      case (null) { return [] };
      case (?enr) { enr };
    };

    let subjectIds = myEnrollments.map(func(e) { e.subjectId });

    meetingLinks.values().toArray().filter(
      func(link) {
        subjectIds.filter(func(id) { id == link.subjectId }).size() > 0;
      }
    );
  };

  // Payment methods
  public shared ({ caller }) func recordPayment(subjectId : Nat, method : Text, amountInPaise : Nat, reference : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can record payments");
    };

    let payment : PaymentRecord = {
      id = paymentIdCounter;
      userId = caller;
      subjectId;
      method;
      amountInPaise;
      currency = "INR";
      status = if (method == "upi") { "pending-verification" } else { "completed" };
      reference;
      timestamp = Time.now();
    };

    payments.add(paymentIdCounter, payment);
    paymentIdCounter += 1;

    if (method != "upi") {
      let newEnrollment : Enrollment = {
        user = caller;
        subjectId;
        paymentReference = reference;
        paymentMethod = method;
        amountInPaise;
        enrolledAt = Time.now();
      };

      let userEnrollments = switch (enrollments.get(caller)) {
        case (null) { [newEnrollment] };
        case (?existingEnr) { existingEnr.concat([newEnrollment]) };
      };

      enrollments.add(caller, userEnrollments);
    };

    paymentIdCounter - 1;
  };

  public shared ({ caller }) func confirmUpiPayment(paymentId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can confirm UPI payments");
    };

    switch (payments.get(paymentId)) {
      case (null) { Runtime.trap("Invalid payment id") };
      case (?payment) {
        let updatedPayment = { payment with status = "completed" };
        payments.add(paymentId, updatedPayment);

        let newEnrollment : Enrollment = {
          user = payment.userId;
          subjectId = payment.subjectId;
          paymentReference = payment.reference;
          paymentMethod = payment.method;
          amountInPaise = payment.amountInPaise;
          enrolledAt = Time.now();
        };

        let userEnrollments = switch (enrollments.get(payment.userId)) {
          case (null) { [newEnrollment] };
          case (?existingEnr) { existingEnr.concat([newEnrollment]) };
        };

        enrollments.add(payment.userId, userEnrollments);
      };
    };
  };

  public query ({ caller }) func getAllPayments() : async [PaymentRecord] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all payments");
    };
    payments.values().toArray();
  };

  public query ({ caller }) func getMyPayments() : async [PaymentRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their payments");
    };

    let filteredPayments = payments.values().toArray().filter(
      func(p) { p.userId == caller }
    );
    filteredPayments;
  };
};
