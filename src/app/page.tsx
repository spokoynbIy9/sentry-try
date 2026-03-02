import ErrorTriggerButton from "@/components/ErrorTriggerButton";

export default function Home() {
  return (
    <main>
      <section className="card">
        <h1>Sentry Demo for Tennis Court Booking</h1>
        <p>
          This page simulates realistic frontend monitoring scenarios for a tennis booking admin panel:
          tagged booking errors, business warnings, unhandled UI crashes, and a traced booking flow.
        </p>
        <ErrorTriggerButton />
        <p className="note">
          Server-side check: open <code>/api/debug-sentry</code> to generate a tagged backend error event.
        </p>
      </section>
    </main>
  );
}
