const express = require("express");
// database
const db = require("../connect/connection");
// utils
const utils = require("../utils/utils");
// login router const
const productsRouter = express.Router();

productsRouter.get("/", async (req, res) => {
  try {
    const { page = 1, item = 5, filter = "", status = 1 } = req.query;
    const countQuery = `SELECT COUNT(*) as count FROM product WHERE (name LIKE "%${filter}%" OR code LIKE "${filter}%") AND status=${status}`;

    const count = await db.handleQuery(countQuery);
    if (!count[0]) utils.sucessResponse(res, [], "success");

    // if exits count pagination then
    const totalPages = Math.ceil(count[0]?.count / item);

    const offset = (page - 1) * item; // offset

    const queryLimitOffset = `SELECT * FROM product WHERE (name LIKE "%${filter}%" OR code LIKE "${filter}%") AND status=${status} ORDER BY id DESC LIMIT ${item} offset ${offset}`;

    const data = await db.handleQuery(queryLimitOffset);
    // data from pagination
    const dataPagination = {
      data: data,
      items_per_page: item,
      current_page: page,
      total_pages: totalPages,
      status: parseInt(status),
    };

    res.json({
      status: "success",
      message: "success",
      data: dataPagination,
    });
  } catch (e) {
    console.log(e);
  }
});

productsRouter.get("/all", async (_, res) => {
  try {
    const query = "SELECT * FROM product WHERE status=1";

    const data = await db.handleQuery(query);

    utils.sucessResponse(res, data, "success");
  } catch (e) {
    console.log(e);
  }
});

productsRouter.post("/", async (req, res) => {
  try {
    const { name, code, price, rol } = req.body;

    const queryVerify = `SELECT COUNT(*) as count FROM product WHERE code="${code}" and status=1`;

    const count = await db.handleQuery(queryVerify);
    if (count[0]?.count) {
      res.status(200).json({
        status: "error",
        message: "ya existe un producto con este código",
      });
    } else {
      const queryCreate = `
          INSERT INTO product (name, code, price, created_at, updated_at, status, updated_by) 
          VALUES ("${name}", "${code}", ${price}, "${new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ")}", "${new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ")}", 1, "${rol}")
        `;

      const data = await db.handleQuery(queryCreate);

      utils.sucessResponse(res, data, "success");
    }
  } catch (e) {
    console.log(e);
  }
});

productsRouter.post("/by-codes", async (req, res) => {
  try {
    const { codes } = req.body;
    const arrayCodes = codes.split(",");
    const data = [];

    if (arrayCodes.length > 0) {
      for (el of arrayCodes) {
        if (el) {
          const querySelect = `SELECT name, code FROM product WHERE code = ${el}`;
          const result = await db.handleQuery(querySelect);
          data.push(result[0]);
        }
      }
      utils.sucessResponse(res, data, "success");
      return;
    }
    utils.sucessResponse(res, [], "success");
  } catch (e) {
    console.log(e);
  }
});

// put
productsRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, price, changeCode, rol } = req.body;

    const queryUpdate = `UPDATE product SET name="${name}", code="${code}", price=${price}, updated_at="${new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ")}", updated_by="${rol}" WHERE id=${id}`;

    // change code is true will verify another code

    if (changeCode) {
      const countQuery = `SELECT COUNT(*) as count FROM product WHERE code="${code}"`;
      const count = await db.handleQuery(countQuery);
      if (count[0]?.count) {
        res.json({
          status: "error",
          data: [],
          message: "El código ya se encuentra en uso",
        });
      } else {
        const data = await db.handleQuery(queryUpdate);
        utils.sucessResponse(res, data, "success");
      }
    } else {
      const data = await db.handleQuery(queryUpdate);
      utils.sucessResponse(res, data, "success");
    }
    // change code is false will not verify another code
  } catch (e) {
    console.log(e);
  }
});

productsRouter.put("/:id/active", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rol } = req.body;

    const queryUpdate = `UPDATE product SET status=${status}, updated_at="${new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ")}", updated_by="${rol}" WHERE id=${id}`;

    const data = await db.handleQuery(queryUpdate);

    utils.sucessResponse(res, data, "success");
  } catch (e) {
    console.log(e);
  }
});

productsRouter.delete("/:id/:rol", async (req, res) => {
  try {
    const { id, rol } = req.params;
    const queryDisable = `UPDATE product SET status=0, updated_at="${new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ")}", updated_by="${rol}" WHERE id=${id}`;

    const data = await db.handleQuery(queryDisable);
    utils.sucessResponse(res, data, "success");
  } catch (e) {
    console.log(e);
  }
});

module.exports = productsRouter;
