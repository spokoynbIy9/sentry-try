import { withSentryConfig } from "@sentry/nextjs";

const nextConfig = {
  reactStrictMode: true
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  reactComponentAnnotation: {
    enabled: true
  },
  tunnelRoute: "/monitoring",
  disableLogger: true
});
