const http = require("http");

function request(path, method, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 5000,
      path: "/api" + path,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          console.error("Failed to parse response:", data);
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on("error", (e) => {
      reject(e);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

(async () => {
  try {
    console.log("--- Starting Verification ---");

    // 1. Auth Login
    console.log("\n1. Testing Login...");
    const loginRes = await request("/auth/login", "POST", {
      email: "jane@example.com",
      password: "password123",
    });
    console.log("Login Status:", loginRes.status);
    if (loginRes.status !== 200) throw new Error("Login failed");
    console.log("User:", loginRes.body.user.name);

    // 2. Initial Dashboard Stats
    console.log("\n2. Fetching Initial Stats...");
    const statsRes1 = await request("/dashboard/stats", "GET");
    console.log("Initial Stats:", statsRes1.body);
    const initialClientCount = statsRes1.body.clients;

    // 3. Create Client
    console.log("\n3. Creating New Client...");
    const clientRes = await request("/clients", "POST", {
      name: "New Corp",
      email: "corp@new.com",
    });
    console.log("Create Client Status:", clientRes.status);
    if (clientRes.status !== 201) throw new Error("Create Client failed");

    // 4. Verify Client in List
    console.log("\n4. Verifying Client List...");
    const clientsListRes = await request("/clients", "GET");
    console.log("Total Clients:", clientsListRes.body.length);
    if (clientsListRes.body.length !== initialClientCount + 1)
      console.error("Client count mismatch!");

    // 5. Create Task
    console.log("\n5. Creating New Task...");
    const taskRes = await request("/tasks", "POST", {
      title: "New Feature",
      client: "New Corp",
      status: "todo",
    });
    console.log("Create Task Status:", taskRes.status);

    // 6. Verify Task in List
    console.log("\n6. Verifying Task List...");
    const tasksRes = await request("/tasks", "GET");
    const todoTasks = tasksRes.body.todo;
    const foundTask = todoTasks.find((t) => t.title === "New Feature");
    console.log("Found New Task:", !!foundTask);

    // 7. Final Dashboard Stats
    console.log("\n7. Fetching Final Stats...");
    const statsRes2 = await request("/dashboard/stats", "GET");
    console.log("Final Stats:", statsRes2.body);

    if (statsRes2.body.clients > initialClientCount) {
      console.log(
        "\n--- Verification SUCCEEDED: State is updating correctly ---",
      );
    } else {
      console.log("\n--- Verification FAILED: State not updating ---");
    }
  } catch (e) {
    console.error("\n--- Verification ERROR ---");
    console.error(e);
  }
})();
