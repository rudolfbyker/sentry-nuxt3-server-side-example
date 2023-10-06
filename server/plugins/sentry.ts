import {
  captureException,
  close,
  Handlers,
  init,
  Integrations,
} from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";

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

  const sentryErrorHandler = Handlers.errorHandler();
  nitroApp.hooks.hook("error", (error, context) => {
    if (context.event) {
      sentryErrorHandler(
        error,
        context.event.node.req,
        context.event.node.res,
        () => {},
      );
    } else {
      captureException(error);
    }
  });

  // Reuse the express middleware provided by Sentry. See https://docs.sentry.io/platforms/node/guides/express/
  // These should come before all other middleware, so we can't use `h3App.use` because that will add them
  // to the end of the stack.
  nitroApp.h3App.stack.unshift(
    { route: "/", handler: fromNodeMiddleware(Handlers.requestHandler()) },
    { route: "/", handler: fromNodeMiddleware(Handlers.tracingHandler()) },
  );

  nitroApp.hooks.hookOnce("close", async () => {
    await close(2000);
  });
});
