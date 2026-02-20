# Conduit Wire Pro (CWP) — App Store Package Checklist

Date: 2026-02-19  
Owner: Product/Admin  
Goal: Ship a complete, submission-ready iOS App Store metadata + compliance package for CWP.

---

## 1) App Store Description Drafts

### A. Short Description (for promo surfaces / one-liner variants)

1. **“Secure jobsite payments, team approvals, and bank-linked contractor workflows.”**
2. **“Run contractor payouts with role-based approvals and real-time payment visibility.”**
3. **“The pro workflow for field invoices, approvals, and compliant bank transfers.”**

### B. Long Description (App Store body)

**Conduit Wire Pro (CWP)** helps electrical and construction teams move money safely from field request to approved payout. Replace spreadsheet chaos and scattered chats with a secure workflow built for contractors, foremen, and office admins.

With CWP, your team can submit payment requests, route approvals, track status in real time, and complete bank-linked disbursements with audit-ready records.

#### Key capabilities
- **Role-based workflows** for field users, project managers, and finance/admin staff
- **Approval routing** with clear status states (pending, approved, rejected, paid)
- **Bank-linked payout flow** with controlled permissions
- **Activity history** and traceability for audits and reconciliation
- **Mobile-first operations** for jobsite and office coordination

#### Built for operational control
- Reduce payment delays caused by missing details and unclear approval ownership
- Prevent unauthorized payouts with explicit role and admin permissions
- Keep teams aligned with shared visibility across projects

#### Who uses CWP
- Electrical contractors
- Specialty trade subcontractors
- Field ops + accounting teams that need tighter payout controls

**Note:** Bank transfer features and admin actions are restricted by account role and organization configuration.

---

## 2) Subtitle + Keyword Drafts

### A. Subtitle options (≤30 chars target)

1. **Contractor Pay Control**
2. **Field-to-Finance Payouts**
3. **Secure Trade Payments**
4. **Approve & Pay Faster**
5. **Team Payment Workflows**
6. **Jobsite Payment Ops**

### B. Keyword set candidates (comma-separated, no spaces preferred in App Store Connect)

#### Primary set (balanced)
contractor,payout,invoice,approval,workflow,jobsite,payments,subcontractor,finance,banking,fieldops,audit,compliance

#### Variant set (ops-heavy)
construction,electrical,tradepay,approvals,disbursement,reconciliation,projectfinance,admincontrols,paymentstatus,securepay

#### Variant set (discovery-heavy)
contractorpay,invoiceapproval,banktransfer,projectpayments,teamapprovals,fieldfinance,payouttracking,billingworkflow

### C. Metadata selection checklist
- [ ] Final subtitle selected and character count verified
- [ ] Final keyword set selected (no trademark conflicts)
- [ ] Overlap minimized between title/subtitle/keywords
- [ ] Regional spelling/localization requirements reviewed
- [ ] Competitor metadata scan completed

---

## 3) Screenshot Shot-List (Exact Screen + Caption)

Use **6.7" iPhone** primary screenshots first; optionally generate 6.5" and 5.5" variants if needed.

### Screenshot 1 — Dashboard / Overview
- **Screen:** Home dashboard with payment pipeline summary (Pending, Approved, Paid)
- **Caption:** **“See Every Payment Status at a Glance”**
- **UI must show:** Active project cards, counts by status, recent activity snippet

### Screenshot 2 — New Payment Request
- **Screen:** Create payment request form (vendor/crew, amount, job code, notes, attachments)
- **Caption:** **“Submit Jobsite Requests in Minutes”**
- **UI must show:** Required fields, validation state, attach receipt/invoice action

### Screenshot 3 — Approval Queue
- **Screen:** Manager/admin approval queue with decision controls
- **Caption:** **“Approve or Reject with Full Context”**
- **UI must show:** Request details, requester identity, project reference, action buttons

### Screenshot 4 — Bank-Linked Payout Step
- **Screen:** Payout confirmation flow (masked account + final review)
- **Caption:** **“Send Secure Bank-Linked Payouts”**
- **UI must show:** Masked account info, authorization confirmation, compliance notice

### Screenshot 5 — Activity & Audit Trail
- **Screen:** Timeline/history view for a single request lifecycle
- **Caption:** **“Track Every Action for Audit Readiness”**
- **UI must show:** timestamps, actor role, state transitions

### Screenshot 6 — Team Roles & Permissions
- **Screen:** Settings/Roles panel showing permission tiers
- **Caption:** **“Control Access by Role”**
- **UI must show:** role matrix or toggles (field user, approver, admin)

### Screenshot production checklist
- [ ] Realistic but anonymized company/job names
- [ ] No personal data or real bank account numbers
- [ ] Legible text on 6.7" display without zoom
- [ ] Consistent visual style and dark/light theme strategy
- [ ] Captions embedded consistently (if using designed frames)
- [ ] Screens reflect currently shipped features only

---

## 4) Privacy Policy + Support Contact Checklist

### A. Privacy policy content checklist
- [ ] Legal entity name and contact email listed
- [ ] Data categories collected (account profile, transactional/payment metadata, device/app logs)
- [ ] Purpose of collection mapped to product functions
- [ ] Data sharing statement (payment processors/banking partners, hosting, analytics)
- [ ] Data retention windows documented
- [ ] User rights process (access, correction, deletion requests)
- [ ] Security controls summary (encryption in transit/at rest, role-based access)
- [ ] Children’s data statement (typically not directed to children under 13)
- [ ] Policy effective date + change notification method
- [ ] Jurisdiction/compliance references as applicable (e.g., CCPA/GDPR where relevant)

### B. App Store Connect privacy form prep
- [ ] Enumerate SDKs and data collection behavior
- [ ] Confirm whether data is linked to user identity
- [ ] Confirm whether data used for tracking/ads (likely “No” for B2B workflow app)
- [ ] Confirm financial info fields used and why
- [ ] Cross-check answers against privacy policy language

### C. Support contact checklist
- [ ] Support email alias created (e.g., support@yourdomain)
- [ ] SLA target defined (e.g., first response <1 business day)
- [ ] Support URL published (help center or contact page)
- [ ] Escalation path documented (payments issue / account lockout / security)
- [ ] Incident response contact for critical payout failures

---

## 5) Bank-Linking + Admin Prerequisites Checklist

### A. Product/feature prerequisites
- [ ] Bank-link provider selected and contracted
- [ ] Sandbox + production credentials provisioned
- [ ] Webhook endpoints configured and verified
- [ ] Account verification/KYC steps documented (if required)
- [ ] ACH/wire capability and limits defined

### B. Role & access prerequisites
- [ ] Admin role can enable/disable payout capability
- [ ] Maker-checker/dual approval thresholds configured
- [ ] Least-privilege defaults for new users
- [ ] Permission audit log enabled and retained

### C. Compliance & risk controls
- [ ] Fraud/risk rules documented (velocity limits, amount caps)
- [ ] Suspicious transaction escalation workflow ready
- [ ] Failed transfer retry policy defined
- [ ] Reversal/chargeback handling process documented
- [ ] Monthly reconciliation owner assigned

### D. Operational readiness
- [ ] Test matrix completed (happy path + failures)
- [ ] Admin runbook written (onboarding, linking, unlinking, incident steps)
- [ ] Finance team sign-off received
- [ ] Legal/compliance sign-off received
- [ ] Go-live checklist reviewed in release meeting

---

## Final Submission Readiness Gate

Mark all as complete before pressing “Submit for Review”:
- [ ] App name, subtitle, keywords finalized
- [ ] Description proofread and legally reviewed
- [ ] Screenshot set exported in required dimensions
- [ ] Privacy policy URL live and reachable
- [ ] Support URL/email live and monitored
- [ ] App Privacy questionnaire aligned with actual behavior
- [ ] Demo/test credentials prepared for App Review (if login-gated)
- [ ] Bank-linking features tested under review-safe demo account

**Result:** Once every box is checked, CWP has a ready-to-execute App Store package for submission.
