export default fromNodeMiddleware((req, res, next) => {
  const randomNumber = (res as any)["randomNumber"];

  process.stdout.write(`middleware request ${randomNumber}\n`);

  res.once("finish", () => {
    process.stdout.write(`middleware response ${randomNumber}\n`);
  });
  next();
});
