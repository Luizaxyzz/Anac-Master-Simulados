import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "../kv_store.tsx";

const app = new Hono();

app.use('*', logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

app.get("/make-server-670d4028/health", (c) => {
  return c.json({ status: "ok" });
});

// Get user data by userId
app.get("/make-server-670d4028/user-data/:userId", async (c) => {
  const userId = c.req.param("userId");
  const data = await kv.get(`user_${userId}`);
  return c.json({ data: data ?? null });
});

// Save user data by userId
app.post("/make-server-670d4028/user-data/:userId", async (c) => {
  const userId = c.req.param("userId");
  const body = await c.req.json();
  await kv.set(`user_${userId}`, body);
  return c.json({ success: true });
});

Deno.serve(app.fetch);
