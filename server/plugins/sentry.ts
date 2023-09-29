import {init, Integrations, startTransaction, Transaction} from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";
import { H3Event } from "h3";

type H3EventWithSentryTransaction = H3Event & {
  sentryTransaction?: Transaction
}

export default defineNitroPlugin((nitroApp) => {
  const runtimeConfig = useRuntimeConfig();

  init({
    dsn: runtimeConfig.public.sentry.dsn,
    environment: "test-sentry-nuxt",
    release: "test-sentry-nuxt",
    integrations: [
      new ProfilingIntegration(),
      new Integrations.Http({ tracing: true }),
    ],
    tracesSampleRate: 1,
    profilesSampleRate: 1,
    debug: true,
  });

  nitroApp.hooks.hook("request", (event: H3Event) => {
    // Start a transaction for this event.
    (event as H3EventWithSentryTransaction).sentryTransaction = startTransaction({
      name: `Nitro ${event.path}`,
      op: "http.server",
    });
  });

  nitroApp.hooks.hook("afterResponse", (event: H3Event) => {
    // Finish the transaction for this event.
    (event as H3EventWithSentryTransaction).sentryTransaction?.finish();
  });
});
