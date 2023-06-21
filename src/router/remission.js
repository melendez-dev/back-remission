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
    const countQuery = `SELECT COUNT(*) as count FROM remission WHERE (identy_user LIKE "${filter}%") AND status IN (${status
      .split(",")
      .join(",")})`;

    const count = await db.handleQuery(countQuery);
    if (!count[0]) utils.sucessResponse(res, [], "success");

    // if exits count pagination then
    const totalPages = Math.ceil(count[0]?.count / item);

    const offset = (page - 1) * item; // offset

    // normal query (code product, name, identy, date) filter
    let queryLimitOffset = `SELECT remission.id, remission.identy_user, remission.payment_method, remission.created_at, remission.user_creator, remission.updated_at, remission.status, remission.observation, user.name FROM remission JOIN user ON (remission.identy_user = user.identy AND remission.type_identy_user = user.type_identy) WHERE (remission.identy_user LIKE "${filter}%" OR user.name LIKE "${filter}%" OR remission.created_at LIKE "${filter}%") AND status IN (${status
      .split(",")
      .join(",")}) ORDER BY remission.id DESC LIMIT ${item} offset ${offset}`;

    // match for id filter
    if (filter.startsWith("id-")) {
      const id = parseInt(filter.substring(3));
      queryLimitOffset = `SELECT remission.id, remission.identy_user, remission.payment_method, remission.created_at, remission.user_creator, remission.updated_at, remission.status, remission.observation, user.name FROM remission JOIN user ON (remission.identy_user = user.identy AND remission.type_identy_user = user.type_identy) WHERE remission.id=${id} AND status IN (${status
        .split(",")
        .join(",")}) ORDER BY remission.id DESC LIMIT ${item} offset ${offset}`;
    }

    const data = await db.handleQuery(queryLimitOffset);

    for (let obj of data) {
      const queryProducts = `SELECT * FROM remission_product WHERE remission_id=${obj.id}`;
      const dataRemissionProducts = await db.handleQuery(queryProducts);
      let arrPrice = [];
      for (let objData of dataRemissionProducts) {
        if (objData?.remission_id === obj.id) {
          arrPrice.push(objData.price * objData.amount);
        }
      }
      obj["total"] = arrPrice.reduce((acc, curr) => acc + curr, 0);
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
    const queryGet = `SELECT * FROM remission WHERE id=${id}`; // get info from remission
    const queryGetProducts = `SELECT * FROM product inner join remission_product on product.code = remission_product.product_code WHERE remission_product.remission_id = ${id}`;

    // data
    const data = await db.handleQuery(queryGet);
    const dataProducts = await db.handleQuery(queryGetProducts);

    data[0]["products"] = dataProducts;

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
    const queryUpdate = `UPDATE remission SET payment_method=${payment_method}, user_updated="${user_updated}", updated_at="${updateFormat}", observation="${observation}", status=1 WHERE id=${id}`;

    const data = await db.handleQuery(queryUpdate);

    // for the products by remission is complicated, is better
    //clean all the products and insert them again
    // to avoid issues with multiple records
    await db.handleQuery(
      `DELETE FROM remission_product WHERE remission_id=${id}`
    ); // clear the records for

    // now insert the records
    // crete promise to insert the records
    const promiseInsert = new Promise(async (resolve, reject) => {
      for (let elementProduct of products) {
        const code = elementProduct?.product?.code;
        const amount = elementProduct?.amount;
        const price = elementProduct?.price;

        const queryInsertProducts = `INSERT INTO remission_product (remission_id, product_code, amount, price) VALUES (${id}, "${code}", ${amount}, ${price})`;

        await db.handleQuery(queryInsertProducts);

        resolve("success");
      }
    });

    promiseInsert.then(() => utils.sucessResponse(res, data, "success"));
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

    const queryRemission = `INSERT INTO remission (identy_user, type_identy_user, payment_method, created_at, user_creator, updated_at, user_updated, status, observation) VALUES ("${identy}", "${type_identy}", ${payment_method}, "${date}", "${rol}", "${date}", "${rol}", 2, "${observation}")`;

    if (is_new) {
      // the user is new then create
      const queryUser = `INSERT INTO user (name, type_identy, identy, addres, city, phone, created_at, created_by) VALUES ("${name}", "${type_identy}", "${identy}", "${addres}", "${city}", "${phone}", "${date}", "${rol}")`;

      await db.handleQuery(queryUser); // create the user if is new

      handleCreateRemission(queryRemission, res);
    } else {
      handleCreateRemission(queryRemission, res);
    }

    // after the remission is created we need to create the products for that remission

    const querySelectLastRemision = `SELECT id FROM remission ORDER BY id DESC LIMIT 1`;
    const lastRemissionCreated = await db.handleQuery(querySelectLastRemision);

    const promiseProducts = new Promise(async (resolve, reject) => {
      for (let elementProduct of products) {
        const id = lastRemissionCreated[0]?.id;
        const code = elementProduct?.product?.code;
        const amount = elementProduct?.amount;
        const price = elementProduct?.price;

        const queryInsertProducts = `INSERT INTO remission_product (remission_id, product_code, amount, price) VALUES (${id}, "${code}", ${amount}, ${price})`;

        await db.handleQuery(queryInsertProducts);
      }

      resolve("success");
    });

    // after created all resoponse with okay
    promiseProducts.then(() => utils.sucessResponse(res, [], "success"));
  } catch (e) {
    console.log(e);
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

    const queryDelete = `UPDATE remission SET status=3, user_updated="${rol}", updated_at="${date}", payment_method=NULL, observation=NULL WHERE id=${id}`;

    // execute the query to update the remisison
    const data = await db.handleQuery(queryDelete);
    await db.handleQuery(
      `DELETE FROM remission_product WHERE remission_id=${id}`
    ); // clear the records for cancellation

    utils.sucessResponse(res, data, "success");
  } catch (e) {
    console.log(e);
  }
});

// helpers

const handleCreateRemission = async (queryRemission, res) => {
  await db.handleQuery(queryRemission);
};

function subtractHours(date, hours) {
  date.setHours(date.getHours() - hours);

  return date;
}

module.exports = remissionRouter;
