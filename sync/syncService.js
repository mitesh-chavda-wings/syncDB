const { executeQuery } = require("../services/dbService");

async function syncDatabase(sourceDbKey, targetDbKey) {
  try {
    // Fetch unsynchronized data from the source
    const unsyncedData = await executeQuery(
      sourceDbKey,
      "SELECT * FROM operations_log WHERE synced = 0"
    );

    // Insert data into the target database
    for (const row of unsyncedData) {
      await executeQuery(targetDbKey, row.query, row.params);
    }

    // Mark operations as synced
    await executeQuery(
      sourceDbKey,
      "UPDATE operations_log SET synced = 1 WHERE synced = 0"
    );
  } catch (error) {
    console.error(`Error syncing ${sourceDbKey} to ${targetDbKey}:`, error);
  }
}

module.exports = {
  syncDatabase,
};
