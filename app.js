const express = require("express");
const { insertData, connections } = require("./services/dbService");
const { checkDatabaseStatus } = require("./services/healthCheck");
const { syncDatabase } = require("./sync/syncService");

const app = express();
app.use(express.json());

// Insert data into active databases
app.post("/insert", async (req, res) => {
  const { query, values } = req.body;
  try {
    const activeDbs = await insertData(query, values);
    res.json({ message: "Data inserted", activeDbs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Periodic health check and sync
setInterval(async () => {
  const status = await checkDatabaseStatus(connections);

  console.log("Database Status:", status);

  // Resynchronize any downed database when it comes back up
  for (const [key, state] of Object.entries(status)) {
    if (state === "UP") {
      for (const [otherKey, otherState] of Object.entries(status)) {
        if (key !== otherKey && otherState === "UP") {
          await syncDatabase(otherKey, key);
        }
      }
    }
  }
}, 10000); // Run every 10 seconds

app.listen(3030, () => {
  console.log("Microservice running on port 3030");
});
