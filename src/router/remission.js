const express = require("express");
// database
const db = require("../connect/connection.js");
// utils
const utils = require("../utils/utils.js");
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

    // normal query (code product, name, identy, date) filter
    let queryLimitOffset = `SELECT remission.id, remission.code_product, remission.identy_user, remission.payment_method, remission.created_at, remission.user_creator, remission.updated_at, remission.status, remission.observation, user.name FROM remission JOIN user ON remission.identy_user = user.identy WHERE (remission.identy_user LIKE "${filter}%" OR remission.code_product LIKE "%${filter}%" OR user.name LIKE "${filter}%" OR remission.created_at LIKE "${filter}%") AND status IN (${status
      .split(",")
      .join(",")}) ORDER BY remission.id DESC LIMIT ${item} offset ${offset}`;

    // match for id filter
    if (filter.startsWith("id-")) {
      const id = parseInt(filter.substring(3));
      queryLimitOffset = `SELECT remission.id, remission.code_product, remission.identy_user, remission.payment_method, remission.created_at, remission.user_creator, remission.updated_at, remission.status, remission.observation, user.name FROM remission JOIN user ON remission.identy_user = user.identy WHERE remission.id=${id} AND status IN (${status
        .split(",")
        .join(",")}) ORDER BY remission.id DESC LIMIT ${item} offset ${offset}`;
    }

    const data = await db.handleQuery(queryLimitOffset);

    let priceArr = [];
    for (let obj of data) {
      for (let product of obj.code_product.split(",")) {
        let query = `SELECT price FROM product WHERE code=${product}`;
        let dataPrice = await db.handleQuery(query);
        priceArr.push(dataPrice[0]?.price);
      }
      obj["total"] = priceArr.reduce((sum, price) => sum + price, 0);
    }

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
    const updateFormat = subtractHours(new Date(), 5)
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

    const date = subtractHours(new Date(), 5)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

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
    const date = subtractHours(new Date(), 5)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

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

function subtractHours(date, hours) {
  date.setHours(date.getHours() - hours);

  return date;
}

module.exports = remissionRouter;
