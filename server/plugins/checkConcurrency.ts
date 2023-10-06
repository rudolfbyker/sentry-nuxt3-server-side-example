/**
 * A plugin that proves that Nitro is serving requests concurrently.
 *
 * If you make multiple simultaneous requests, you will see the console logs in the following order:
 * - init
 * - request 1
 * - request 2
 * - afterResponse 1
 * - afterResponse 2
 */
export default defineNitroPlugin((nitroApp) => {
  process.stdout.write("plugin init\n");

  nitroApp.hooks.hook("request", (event) => {
    const randomNumber = Math.floor(Math.random() * 1000);
    process.stdout.write(`plugin request ${randomNumber}\n`);
    (event as any).randomNumber = randomNumber;
  });

  nitroApp.hooks.hook("afterResponse", (event) => {
    process.stdout.write(`plugin afterResponse ${(event as any).randomNumber}\n`);
  });
});
