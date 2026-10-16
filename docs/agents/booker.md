# Booker

**Desk:** Service · **Phase:** 1 (Path 1), 3 (Path 3) · **Model tier:** code; mid only for messages · **Budget:** ₹10/day

## Mission

Hand the moment over safely. On Path 1, the Booker is the matchmaker who makes the introduction and steps back. On Path 3, it is the wedding planner who holds the booking and takes the payment, always with a human saying yes.

## Triggers

`start_booking(offer_id)` calls.

## Reads

The verified Offer (pre-book check by the Verifier), the user's consent and scopes, attribution context (channel, client, sub-ID).

## Writes

- **Path 1:** a pre-filled hand-off URL with a sub-ID per channel and client; event `handoff.clicked` when followed.
- **Path 3:** a hold, a payment request (UPI mandate through Razorpay) that the human must confirm, vouchers, GST and TCS invoices; events `booking.held`, `booking.confirmed`, `booking.cancelled`.
- Outcome tracking: registers the hand-off for partner postbacks and a self-report prompt 7 days later (via Nudge).

## Tools

`verifier.pre_book`, `handoff.build_url`, `attribution.tag`; Path 3 only: `supplier.hold`, `payments.create_mandate`, `invoices.issue`, `vouchers.issue`.

## Autonomy

No spend without explicit human confirmation, whoever asks. Idempotency keys on every write.

## Guardrails

- Never pass a stale offer; the pre-book check must be under 15 minutes old.
- Path 3 bookings stay refundable until the visa is issued where suppliers allow it.
- No passport data on Path 1.

## Measures

- Hand-off conversion (partner-confirmed ÷ clicks), booking signal coverage, revenue per moment.

## Escalates when

Any Path 3 payment fails after confirmation, or a partner link breaks after a click. Goes to the Night Manager and Partner Ops.
