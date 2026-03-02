"use client";

import * as Sentry from "@sentry/nextjs";

export default function ErrorTriggerButton() {
  const triggerHandledError = () => {
    Sentry.setUser({
      id: "demo-admin-42",
      username: "court-admin",
    });

    Sentry.setTag("module", "booking");
    Sentry.setTag("surface", "web-admin");

    const error = new Error("Booking creation failed: selected slot is no longer available");
    Sentry.captureException(error, {
      tags: {
        feature: "create-booking",
        severity: "critical",
      },
      extra: {
        clubId: "club_spb_central",
        courtId: "court_3",
        bookingDate: "2026-03-01",
        slot: "19:00-20:00",
      },
    });

    alert("Tagged booking error captured and sent to Sentry.");
  };

  const triggerUnhandledError = () => {
    throw new Error("Unhandled UI crash in booking modal");
  };

  const triggerBusinessMessage = () => {
    Sentry.captureMessage("Payment webhook status mismatch detected in booking flow", {
      level: "warning",
      tags: {
        feature: "payment-status",
        module: "booking",
      },
      extra: {
        bookingId: "booking_10017",
        expectedStatus: "paid",
        actualStatus: "pending",
      },
    });

    alert("Business warning sent to Sentry.");
  };

  const triggerTraceDemo = async () => {
    await Sentry.startSpan(
      {
        name: "booking.checkout",
        op: "business.transaction",
        attributes: {
          "app.feature": "booking",
          "app.surface": "web-admin",
        },
      },
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 250));

        await Sentry.startSpan(
          {
            name: "booking.calculate-price",
            op: "business.step",
          },
          async () => {
            await new Promise((resolve) => setTimeout(resolve, 180));
          },
        );

        await Sentry.startSpan(
          {
            name: "booking.reserve-slot",
            op: "http.client",
          },
          async () => {
            await fetch("/api/debug-sentry");
          },
        );
      },
    );

    alert("Trace demo executed. Check Sentry performance traces and linked error.");
  };

  return (
    <>
      <button className="primary" onClick={triggerHandledError}>
        Send tagged booking error
      </button>
      <button className="danger" onClick={triggerUnhandledError}>
        Throw unhandled UI error
      </button>
      <button className="primary" onClick={triggerBusinessMessage}>
        Send business warning
      </button>
      <button className="primary" onClick={triggerTraceDemo}>
        Run booking trace demo
      </button>
    </>
  );
}
