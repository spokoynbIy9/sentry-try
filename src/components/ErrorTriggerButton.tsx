"use client";

import * as Sentry from "@sentry/nextjs";

export default function ErrorTriggerButton() {
  const triggerHandledError = () => {
    const error = new Error("Demo handled error from Next.js button");
    Sentry.captureException(error);
    alert("Handled error captured and sent to Sentry.");
  };

  const triggerUnhandledError = () => {
    throw new Error("Demo unhandled error from Next.js button");
  };

  return (
    <>
      <button className="primary" onClick={triggerHandledError}>
        Send handled error
      </button>
      <button className="danger" onClick={triggerUnhandledError}>
        Throw unhandled error
      </button>
    </>
  );
}
