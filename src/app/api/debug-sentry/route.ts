import * as Sentry from "@sentry/nextjs";

export async function GET() {
  const eventId = Sentry.captureException(
    new Error("Server booking sync failed after checkout"),
    {
      tags: {
        module: "booking",
        feature: "server-sync",
        severity: "critical",
      },
      extra: {
        bookingId: "booking_10017",
        courtId: "court_3",
        paymentStatus: "paid",
        bookingStatus: "pending_sync",
      },
    },
  );
  await Sentry.flush(5000);

  return Response.json({ ok: false, eventId }, { status: 500 });
}
