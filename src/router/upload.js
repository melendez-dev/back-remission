const express = require("express");
// database
const db = require("../connect/connection");
// multer
const multer = require("multer");
// utils
const utils = require("../utils/utils");
// login router const
const uploadRouter = express.Router();
const readXlsxFile = require("read-excel-file/node");

const upload = multer({ dest: "uploads/" });

uploadRouter.post("/users/:rol", upload.single("file"), async (req, res) => {
  try {
    const { rol } = req.params;
    const rows = await readXlsxFile(req.file.path);

    const promises = [];

    for (const item of rows) {
      const queryIdentifier = `SELECT * FROM user WHERE identy="${item[2]}" AND type_identy="${item[1]}"`;
      const result = await db.handleQuery(queryIdentifier);

      if (Boolean(!result.length)) {
        const date = subtractHours(new Date(), 5)
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");

        const queryCreate = `
          INSERT INTO user (name, type_identy, identy, addres, city, phone, created_at, created_by) 
          VALUES ("${item[0]}", "${item[1]}", "${item[2]}", "${item[6]}", "${item[7]}", "${item[8]}", "${date}", "${rol}")
        `;

        promises.push(db.handleQuery(queryCreate));
      }
    }

    await Promise.all(promises);

    res.json({
      message: "se ha guardado correctamente",
      data: [],
      status: 200,
    });
  } catch (e) {
    utils.errorReponse(res, 500, e);
  }
});

uploadRouter.post("/products/:rol", upload.single("file"), async (req, res) => {
  try {
    const { rol } = req.params;
    const rows = await readXlsxFile(req.file.path);

    const promises = [];

    for (const item of rows) {
      const queryIdentifier = `SELECT * FROM product WHERE code="${item[1]}" AND status=1`;
      const result = await db.handleQuery(queryIdentifier);

      if (Boolean(!result.length)) {
        const date = subtractHours(new Date(), 5)
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");

        const queryCreate = `INSERT INTO product (name, code, price, created_at, updated_at, status, updated_by) VALUES ('${item[2]}', "${item[1]}", ${item[11]}, "${date}", "${date}", 1, "${rol}")`;
        if (!queryCreate.includes("null")) {
          promises.push(db.handleQuery(queryCreate));
        }
      }
    }

    await Promise.all(promises);

    res.json({
      message: "Se ha guardado correctamente",
      data: [],
      status: 200,
    });
  } catch (e) {
    utils.errorReponse(res, 500, e);
  }
});

function subtractHours(date, hours) {
  date.setHours(date.getHours() - hours);

  return date;
}

module.exports = uploadRouter;
