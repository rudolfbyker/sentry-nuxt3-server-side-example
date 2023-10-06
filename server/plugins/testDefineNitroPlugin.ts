import { type H3Event } from "h3";

export default defineNitroPlugin((nitroApp) => {
  process.stdout.write("plugin init\n");

  nitroApp.hooks.hook("request", (event: H3Event) => {
    const randomNumber = Math.floor(Math.random() * 1000);
    (event.node.res as any).randomNumber = randomNumber;
    process.stdout.write(`plugin request ${randomNumber}\n`);
  });

  nitroApp.hooks.hook("afterResponse", (event: H3Event) => {
    const randomNumber = (event.node.res as any)["randomNumber"];
    process.stdout.write(`plugin response ${randomNumber}\n`);
  });
});
