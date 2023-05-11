const mysql = require("mysql");
const utils = require("../utils/utils.js");

const handleQuery = (sqlQuery) => {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection(utils.connectionDB);
    connection.connect();
    connection.query(sqlQuery, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows ? JSON.parse(JSON.stringify(rows)) : []);
      }
      connection.end();
    });
  });
};

module.exports = {
  handleQuery,
};
