const request = require("supertest");
const app = require("./index");

describe("FlashClash API", () => {
  test("GET /status returns ok", async () => {
    const res = await request(app).get("/status");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body).toHaveProperty("uptime_seconds");
    expect(res.body).toHaveProperty("timestamp");
  });

  test("GET /stress returns completion message", async () => {
    const res = await request(app).get("/stress");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("stress test complete");
  });
});
