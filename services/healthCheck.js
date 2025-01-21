async function checkDatabaseStatus(connections) {
  const status = {};
  for (const [key, conn] of Object.entries(connections)) {
    try {
      await conn.query("SELECT 1"); // Simple query to check connection
      status[key] = "UP";
    } catch (error) {
      status[key] = "DOWN";
    }
  }
  return status;
}

module.exports = {
  checkDatabaseStatus,
};
