import * as Sentry from "@sentry/nextjs";

export async function GET() {
  try {
    throw new Error("Demo server-side error from /api/debug-sentry");
  } catch (error) {
    Sentry.captureException(error);
    await Sentry.flush(2000); // дать времени отправиться
    return new Response("Server error sent to Sentry", { status: 500 });
  }
}
