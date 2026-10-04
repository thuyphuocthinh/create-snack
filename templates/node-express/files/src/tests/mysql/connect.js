const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  port: 3307,
  user: "root",
  password: "123456",
  database: "shopDEV",
});

const batchSize = 100000; // Số lượng bản ghi chèn mỗi lần
const totalSize = 1000000; // Tổng số bản ghi cần chèn
let currentId = 1;

console.time("Start");

const insertBatch = () => {
  return new Promise((resolve, reject) => {
    const values = [];
    for (let i = 0; i < batchSize && currentId <= totalSize; i++) {
      const name = `name-${currentId}`;
      const age = currentId;
      values.push([currentId, name, age]); // Mỗi bản ghi là một mảng [id, name, age]
      currentId++;
    }

    if (values.length === 0) {
      return resolve(); // Không còn bản ghi nào để chèn
    }

    const sql = `INSERT INTO test_table (id, name, age) VALUES ?`;
    pool.query(sql, [values], (err, result) => {
      if (err) return reject(err);
      console.log(`Inserted ${result.affectedRows} rows`);
      resolve();
    });
  });
};

const runInsert = async () => {
  try {
    while (currentId <= totalSize) {
      await insertBatch();
    }
    console.timeEnd("Start");
  } catch (err) {
    console.error("Error inserting data:", err);
  } finally {
    pool.end((err) => {
      if (err) {
        console.error("Error closing connection pool:", err);
      } else {
        console.log("Connection pool closed successfully");
      }
    });
  }
};

runInsert();
