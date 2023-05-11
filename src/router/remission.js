const express = require("express");
// database
const db = require("../connect/connection");
// utils
const utils = require("../utils/utils");
// login router const
const remissionRouter = express.Router();

// get
remissionRouter.get("/", async (req, res) => {
  try {
    const { page = 1, item = 5, filter = "", status } = req.query;
    const countQuery = `SELECT COUNT(*) as count FROM remission WHERE (identy_user LIKE "${filter}%" OR code_product LIKE "%${filter}%") AND status IN (${status
      .split(",")
      .join(",")})`;

    const count = await db.handleQuery(countQuery);
    if (!count[0]) utils.sucessResponse(res, [], "success");

    // if exits count pagination then
    const totalPages = Math.ceil(count[0]?.count / item);

    const offset = (page - 1) * item; // offset

    const queryLimitOffset = `SELECT * FROM remission WHERE (identy_user LIKE "${filter}%" OR code_product LIKE "%${filter}%") AND status IN (${status
      .split(",")
      .join(",")}) ORDER BY id DESC LIMIT ${item} offset ${offset}`;

    const data = await db.handleQuery(queryLimitOffset);

    // data from pagination
    const dataPagination = {
      data: data,
      items_per_page: item,
      current_page: page,
      total_pages: totalPages,
    };

    res.json({
      status: "success",
      message: "success",
      data: dataPagination,
    });
  } catch (e) {
    utils.errorReponse(res, 500, e?.message);
  }
});

remissionRouter.get("/by-id/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const queryGet = `SELECT * FROM remission WHERE id=${id}`;
    const data = await db.handleQuery(queryGet);
    utils.sucessResponse(res, data, "success");
  } catch (e) {
    console.log(e);
  }
});

remissionRouter.put("/by-id/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method, products, user_updated, observation } = req.body;
    const updateFormat = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    const queryUpdate = `UPDATE remission SET payment_method=${payment_method}, code_product="${products}", user_updated="${user_updated}", updated_at="${updateFormat}", observation="${observation}", status=1 WHERE id=${id}`;

    const data = await db.handleQuery(queryUpdate);
    utils.sucessResponse(res, data, "success");
  } catch (e) {
    console.log(e);
  }
});

// post
remissionRouter.post("/", async (req, res) => {
  try {
    const {
      type_identy,
      identy,
      name,
      phone,
      city,
      addres,
      payment_method,
      is_new,
      products,
      rol,
      status,
      observation = null,
    } = req.body;

    const date = new Date().toISOString().slice(0, 19).replace("T", " ");

    const queryRemission = `INSERT INTO remission (code_product, identy_user, payment_method, created_at, user_creator, updated_at, user_updated, status, observation) VALUES ("${products}", "${identy}", ${payment_method}, "${date}", "${rol}", "${date}", "${rol}", 2, "${observation}")`;

    if (is_new) {
      // the user is new then create
      const queryUser = `INSERT INTO user (name, type_identy, identy, addres, city, phone, created_at, created_by) VALUES ("${name}", "${type_identy}", "${identy}", "${addres}", "${city}", "${phone}", "${date}", "${rol}")`;

      await db.handleQuery(queryUser);

      handleCreateRemission(queryRemission, res);
    } else {
      handleCreateRemission(queryRemission, res);
    }
  } catch (e) {
    utils.errorReponse(res, 500, "Error en la conexión a la base de datos");
  }
});

// delete
remissionRouter.put("/cancel-id/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;
    const date = new Date().toISOString().slice(0, 19).replace("T", " ");
    const queryDelete = `UPDATE remission SET status=3, user_updated="${rol}", updated_at="${date}", code_product="", payment_method=NULL, observation=NULL WHERE id=${id}`;

    const data = await db.handleQuery(queryDelete);

    utils.sucessResponse(res, data, "success");

  } catch (e) {
    console.log(e);
  }
});

// helpers

const handleCreateRemission = async (queryRemission, res) => {
  const data = await db.handleQuery(queryRemission);

  utils.sucessResponse(res, data, "success");
};

module.exports = remissionRouter;
