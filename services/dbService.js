const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbConfig");
const winston = require("winston"); // For logging

// Create connections for all three databases
const connections = {
  db1: mysql.createPool(dbConfig.db1),
  db2: mysql.createPool(dbConfig.db2),
  db3: mysql.createPool(dbConfig.db3),
};

// Function to execute a query on a specific database
async function executeQuery(dbKey, query, values) {
  try {
    const [rows] = await connections[dbKey].query(query, values);
    return rows;
  } catch (error) {
    winston.error(`Error executing query on ${dbKey}: ${error.message}`);
    throw error;
  }
}

// Function to insert data into operational databases
async function insertData(query, values) {
  const activeDbs = [];

  for (const [key, conn] of Object.entries(connections)) {
    try {
      await conn.query(query, values);
      activeDbs.push(key);
    } catch (error) {
      winston.warn(`${key} is down: ${error.message}`);
    }
  }

  if (activeDbs.length === 0) {
    throw new Error("All databases are down!");
  }

  return activeDbs;
}

module.exports = {
  connections,
  executeQuery,
  insertData,
};
