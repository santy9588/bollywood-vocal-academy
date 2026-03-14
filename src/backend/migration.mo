import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  type OldActor = {
    userProfiles : Map.Map<Principal, { name : Text }>;
    visitors : Map.Map<Text, {
      sessionId : Text;
      page : Text;
      eventType : Text;
      scrollDepth : Nat;
      timestamp : Time.Time;
    }>;
    leads : Map.Map<Nat, {
      name : Text;
      phone : Text;
      email : Text;
      interestedSubject : Text;
      timestamp : Time.Time;
    }>;
    enrollments : Map.Map<Principal, [{
      user : Principal;
      subjectId : Nat;
      paymentReference : Text;
      enrolledAt : Time.Time;
    }]>;
    meetingLinks : Map.Map<Nat, {
      id : Nat;
      platform : Text;
      url : Text;
      subjectId : Nat;
      title : Text;
      scheduledAt : Time.Time;
      createdAt : Time.Time;
    }>;
    leadIdCounter : Nat;
    meetingLinkIdCounter : Nat;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, { name : Text }>;
    visitors : Map.Map<Text, {
      sessionId : Text;
      page : Text;
      eventType : Text;
      scrollDepth : Nat;
      timestamp : Time.Time;
    }>;
    leads : Map.Map<Nat, {
      name : Text;
      phone : Text;
      email : Text;
      interestedSubject : Text;
      timestamp : Time.Time;
    }>;
    enrollments : Map.Map<Principal, [{
      user : Principal;
      subjectId : Nat;
      paymentReference : Text;
      paymentMethod : Text;
      amountInPaise : Nat;
      enrolledAt : Time.Time;
    }]>;
    meetingLinks : Map.Map<Nat, {
      id : Nat;
      platform : Text;
      url : Text;
      subjectId : Nat;
      title : Text;
      scheduledAt : Time.Time;
      createdAt : Time.Time;
    }>;
    payments : Map.Map<Nat, {
      id : Nat;
      userId : Principal;
      subjectId : Nat;
      method : Text;
      amountInPaise : Nat;
      currency : Text;
      status : Text;
      reference : Text;
      timestamp : Time.Time;
    }>;
    leadIdCounter : Nat;
    meetingLinkIdCounter : Nat;
    paymentIdCounter : Nat;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      enrollments = old.enrollments.map(
        func(_k, v) { v.map(func(e) { { e with paymentMethod = "legacy" : Text; amountInPaise = 0 } }) }
      );
      payments = Map.empty<Nat, {
        id : Nat;
        userId : Principal;
        subjectId : Nat;
        method : Text;
        amountInPaise : Nat;
        currency : Text;
        status : Text;
        reference : Text;
        timestamp : Time.Time;
      }>();
      paymentIdCounter = 0;
    };
  };
};
