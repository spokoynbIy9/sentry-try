import ErrorTriggerButton from "@/components/ErrorTriggerButton";

export default function Home() {
  return (
    <main>
      <section className="card">
        <h1>Sentry + Next.js + TypeScript Demo</h1>
        <p>
          This page has two buttons. One sends a handled error with <code>Sentry.captureException</code>,
          the other throws an unhandled error.
        </p>
        <ErrorTriggerButton />
        <p className="note">
          Server-side check: open <code>/api/debug-sentry</code> to generate a backend error event.
        </p>
      </section>
    </main>
  );
}
