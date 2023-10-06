import {
  captureException,
  getCurrentHub,
  init,
  Integrations,
  startTransaction,
  Transaction,
  close,
} from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";
import { H3Event } from "h3";

type H3EventWithSentryTransaction = H3Event & {
  sentryTransaction?: Transaction;
};

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

  nitroApp.hooks.hook("error", (error) => {
    captureException(error);
  });

  nitroApp.hooks.hook("request", (event: H3Event) => {
    // Start a transaction for this event.
    const transaction = startTransaction({
      name: `Nitro ${event.path}`,
      op: "http.server",
    });

    // Store the transaction on the event so that we know which one to finish later.
    (event as H3EventWithSentryTransaction).sentryTransaction = transaction;

    // Set the transaction on the current scope to associate with errors and get included span instrumentation.
    // FIXME: Since Nitro is concurrent, a new request may start before the previous one finishes.
    //   In this case, creating a new transaction will drop the previous one.
    getCurrentHub().configureScope((scope) => scope.setSpan(transaction));
  });

  nitroApp.hooks.hook("afterResponse", (event: H3Event) => {
    // Finish the transaction for this event.
    (event as H3EventWithSentryTransaction).sentryTransaction?.finish();
  });

  nitroApp.hooks.hookOnce("close", async () => {
    await close(2000);
  });
});
