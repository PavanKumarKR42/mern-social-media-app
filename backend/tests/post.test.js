const request = require("supertest");
const app = require("../server"); // or wherever your Express app is exported
const mongoose = require("mongoose");

describe("POST /api/posts/create", () => {
  it("should not allow creating a post without auth", async () => {
    const res = await request(app).post("/api/posts/create").send({
      text: "Unauthorized post",
    });
    expect(res.statusCode).toBe(401); // Unauthorized
  });
});

// Add more tests here...

afterAll(async () => {
  await mongoose.connection.close(); // Close DB connection after tests
});
