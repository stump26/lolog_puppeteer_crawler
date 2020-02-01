const Koa = require("koa");
const Router = require("@koa/router");
const opggHeadless = require("./opggHeadless");

const app = new Koa();
const router = new Router();

router.get("/", async (ctx, next) => {
  ctx.type = "json";
  const result = await opggHeadless();
  ctx.body = result;
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);
