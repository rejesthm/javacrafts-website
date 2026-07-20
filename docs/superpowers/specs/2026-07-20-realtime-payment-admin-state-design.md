# Real-time payment and admin state design

## Goal

Replace repeated payment-status polling and manual admin refreshes with event-driven updates sourced from Firestore. PayMongo's verified webhook remains the only authority that changes payment state.

## Data flow

1. PayMongo sends an event to the existing webhook route.
2. The route verifies the PayMongo signature and applies the event idempotently to the private Firestore order document.
3. Server-owned real-time streams observe the relevant Firestore documents or query.
4. The payment page receives only public payment fields for its order. The admin stream receives the order list only after validating the admin session.
5. React state changes only when streamed data differs from the current state.

## Architecture

### Shared stream transport

Use Server-Sent Events (SSE) exposed through Next.js route handlers. Each response uses `text/event-stream`, sends an initial snapshot, emits subsequent snapshots, sends periodic keepalive comments, and closes its Firestore listener when the browser disconnects.

Messages use a small envelope:

```json
{ "type": "snapshot", "data": {} }
```

Errors that occur before streaming starts use normal JSON HTTP errors. A failure after streaming starts emits an `error` event and closes the stream so the browser can reconnect.

### Customer payment stream

Add an order-scoped payment stream route. It listens to the private `orders/{orderId}` document using the Firebase Admin SDK and maps every snapshot through the existing public-payment serializer. The browser never receives customer, fulfillment, internal PayMongo, or webhook metadata.

The payment client replaces its polling effect with one `EventSource`. It shows the QR from the initial snapshot, leaves that QR mounted when unchanged, redirects to the thank-you page after a `paid` snapshot, and shows terminal UI for `failed` or `expired`. Native `EventSource` reconnection handles temporary network loss; the UI reports a connection problem without discarding its last valid payment state.

### Admin orders stream

Add an authenticated admin stream route. It verifies the existing HTTP-only admin session before opening a Firestore listener for recent orders. Snapshots use the same order mapping and signing behavior as the current admin order loader.

Move the orders table and summary statistics into a focused client component initialized with the server-rendered order list. That component opens the stream and updates the table and statistics in place. The surrounding admin shell and authentication remain server-rendered.

Admin mutations continue using authenticated Server Actions. Their Firestore writes naturally trigger the open listener, so the UI does not need a manual route refresh for order-state changes.

## Security

- Keep `/orders` denied to direct browser reads and writes in Firestore rules.
- Keep Firebase Admin credentials exclusively on the server.
- Return only the existing `PublicOrderPayment` shape to the customer stream.
- Validate the admin session before querying or streaming orders.
- Preserve PayMongo signature validation, event normalization, and duplicate-event protection.
- Treat an unknown order as `404` before opening the customer stream.

## Lifecycle and resource handling

- Every stream owns exactly one Firestore unsubscribe function.
- Abort or cancellation closes the listener and keepalive timer.
- A client owns exactly one `EventSource` per mounted page and closes it on unmount.
- Identical payment snapshots do not replace React state, preventing unnecessary QR image rerenders.
- Stream consumers tolerate duplicate snapshots because webhook delivery and connection recovery can both repeat data.

## Error handling

- Keep the last valid snapshot visible during a temporary stream interruption.
- Let `EventSource` reconnect automatically for transient failures.
- Display a non-destructive connection warning instead of returning the QR page to its initial loading state.
- Redirect an expired admin session to the login page when stream authorization fails.
- Log server listener errors without including order or customer payloads.

## Testing

- Unit-test public payment serialization and snapshot equality behavior.
- Test that the customer stream never contains private order fields.
- Test unknown-order and Firebase-configuration failures.
- Test that the admin stream rejects missing or invalid sessions.
- Test client handling for initial, pending, paid, failed, expired, duplicate, and reconnect states.
- Run the existing test, lint, and production-build commands.

## Non-goals

- Changing PayMongo payment creation or webhook semantics.
- Allowing direct public Firestore access to order documents.
- Regenerating QR codes during status updates.
- Redesigning the checkout or admin interface.
