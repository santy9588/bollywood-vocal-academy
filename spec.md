# Learn Techy

## Current State
- 4 subjects: English, Singing, Computer, Government Exam Preparation
- Stripe payment at ₹499 flat per subject (single tier)
- Visitor tracking, lead management, meeting links
- Admin dashboard with 4 tabs: Visitors, Leads, Enrollments, Meeting Links
- Student dashboard with enrolled courses and meeting links

## Requested Changes (Diff)

### Add
- **UPI QR code payment method**: Display a static UPI QR code image on the enroll card. Student scans with PhonePe / Google Pay / Paytm / BHIM / any UPI app and enters their UTR (transaction reference) number to submit enrollment manually. UTR is stored as paymentReference.
- **Razorpay checkout**: Add Razorpay as a second gateway option. Store Razorpay key_id in backend config (admin sets it). On the enroll card, student can pick "Pay via Razorpay" which opens the Razorpay checkout widget covering UPI, NetBanking, Cards, and Wallets. On success, auto-enroll.
- **Fee tiers / pricing plans**: Replace the flat ₹499 price with 3 tiers:
  - Full Course: ₹499 (one-time, lifetime access)
  - Monthly Plan: ₹199/month (3-month minimum shown, total ₹597)
  - Group / Family: ₹899 for 2 people (shared enrollment)
- **Admin: Payments tab**: New 5th tab in Admin Dashboard showing all payment records — method (Stripe / Razorpay / UPI), amount, status (completed / pending-verification / failed), UTR reference for UPI payments.
- **Backend: RazorpayConfig type**: Store Razorpay key_id. Admin can set it. Frontend reads it to initialise Razorpay checkout.
- **Backend: UpiConfig type**: Store admin's UPI ID and display name so admin can change the UPI address without redeploying.
- **Backend: PaymentRecord type**: Track all payment attempts — method, amount, currency, status, reference, subjectId, userId, timestamp.
- **Backend: FeeOption type**: Store available fee tiers with name, amount, description.

### Modify
- **SubjectDetailPage enroll card**: Replace single "Enroll Now — ₹499" button with:
  1. Fee tier selector (3 radio-style cards)
  2. Payment method selector: Stripe | Razorpay | UPI QR
  3. Conditional UI per method (Stripe checkout redirect, Razorpay widget, UPI QR + UTR input form)
- **Enrollment record**: paymentReference now stores method-prefixed ref (e.g. `upi:UTR123456`, `razorpay:pay_xxx`, `stripe:cs_xxx`) and amount paid.
- **Admin Dashboard**: Add 5th "Payments" tab showing PaymentRecord list.

### Remove
- Nothing removed; existing Stripe flow is kept as one of the payment options.

## Implementation Plan
1. Update `main.mo`:
   - Add `RazorpayConfig`, `UpiConfig`, `PaymentRecord`, `FeeOption` types
   - Add `setRazorpayConfig`, `getRazorpayPublicKey`, `setUpiConfig`, `getUpiConfig` functions
   - Add `recordPayment`, `getAllPayments`, `getMyPayments` functions
   - Add `getFeeOptions` query (returns 3 fixed tiers)
   - Modify `enroll` to also accept `amountPaid` and `paymentMethod`
2. Generate UPI QR placeholder image (admin will swap with real QR from their UPI app)
3. Update frontend:
   - SubjectDetailPage: fee tier picker + payment method tabs (Stripe / Razorpay / UPI)
   - UPI flow: show QR image + UPI ID, UTR input, submit button
   - Razorpay flow: load Razorpay script, open checkout widget, on success enroll
   - AdminPage: add Payments tab + Razorpay/UPI config settings panel
   - DashboardPage: show payment method used per enrollment
