const express = require("express");
// database
const db = require("../connect/connection.js");
// utils
const utils = require("../utils/utils.js");
// login router const
const boxMovementRouter = express.Router();

boxMovementRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const queryById = `SELECT * FROM box_movement WHERE id_box=${id}`;
    const data = await db.handleQuery(queryById);
    let price_total = 0;
    for (let element of data) {
      if (element?.type == 1) {
        price_total += element.price;
      } else {
        price_total -= element.price;
      }
    }
    res.json({
      status: "success",
      message: "success",
      data: {
        price_total,
        data,
      },
    });
  } catch (e) {
    utils.errorReponse(res, 500, e);
  }
});

boxMovementRouter.post("/incomes", async (req, res) => {
  try {
    const {
      consecutive,
      type_income,
      price,
      observation,
      id_box,
      user_creator,
      user_updated,
      type,
      status,
    } = req.body;

    // verify is exist the consecutive
    const queryConsecutive = `SELECT * FROM box_movement WHERE consecutive="${consecutive}"`

    const dataConsecutive = await db.handleQuery(queryConsecutive);

    if (dataConsecutive.length) {
      res.json({
        status: "error",
        message: "El consecutivo ya existe",
        data: []
      })

      return // finished successfully
    }

    const date = new Date().toISOString().slice(0, 19).replace("T", " ");
    const queryCreate = `INSERT INTO box_movement (consecutive, type, id_box, observations, created_at, user_creator, updated_at, user_update, status, price, type_income) VALUES ("${consecutive}",  ${type},  ${id_box}, "${observation}", "${date}", "${user_creator}", "${date}", "${user_updated}", ${status}, ${price}, ${type_income} )`;
    const data = await db.handleQuery(queryCreate);

    // update price
    const querySelectBox = `SELECT opening FROM box WHERE id = ${id_box}`;
    const dataBox = await db.handleQuery(querySelectBox);

    const queryUpdateOpening = `UPDATE box SET opening =${
      dataBox[0]?.opening + price
    } where id = ${id_box}`;

    await db.handleQuery(queryUpdateOpening);

    utils.sucessResponse(res, data, "success");
  } catch (e) {
    utils.errorReponse(res, 500, e);
  }
});

boxMovementRouter.post("/outcomes", async (req, res) => {
  try {
    const {
      id_box,
      observation,
      price,
      type,
      user_creator,
      user_updated,
      status,
    } = req.body;
    const date = new Date().toISOString().slice(0, 19).replace("T", " ");
    const queryCreate = `INSERT INTO box_movement (consecutive, type, id_box, observations, created_at, user_creator, updated_at, user_update, status, price, type_income) VALUES (NULL,  ${type},  ${id_box}, "${observation}", "${date}", "${user_creator}", "${date}", "${user_updated}", ${status}, ${price}, NULL)`;
    const data = await db.handleQuery(queryCreate);

    // update price box
    const querySelectBox = `SELECT opening FROM box WHERE id = ${id_box}`;
    const dataBox = await db.handleQuery(querySelectBox);

    const queryUpdateOpening = `UPDATE box SET opening =${
      dataBox[0]?.opening - price
    } where id = ${id_box}`;

    await db.handleQuery(queryUpdateOpening);

    utils.sucessResponse(res, data, "success");
  } catch (e) {
    utils.errorReponse(res, 500, e);
  }
});

boxMovementRouter.get("/close/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const queryMovement = `SELECT * FROM box_movement WHERE id_box = ${id}`;
    const allMovements = await db.handleQuery(queryMovement);
    const data = {
      cash: 0,
      bancolombia: 0,
      nequi: 0,
      daviplata: 0,
      card: 0,
      outcomes: 0,
    };

    for (const element of allMovements) {
      if (element?.type_income) {
        switch (element.type_income) {
          case 1:
            data["cash"] += element?.price;
            break;
          case 2:
            data["bancolombia"] += element?.price;
            break;
          case 3:
            data["nequi"] += element?.price;
            break;
          case 4:
            data["daviplata"] += element?.price;
            break;
          case 5:
            data["card"] += element?.price;
            break;
          default:
            return;
            break;
        }
      } else {
        data["outcomes"] += element?.price;
      }
    }
    utils.sucessResponse(res, [data], "success");
  } catch (e) {
    console.log(e);
  }
});

module.exports = boxMovementRouter;
