const express = require("express");
// database
const db = require("../connect/connection");
// utils
const utils = require("../utils/utils");
// login router const
const boxRouter = express.Router();

boxRouter.get("/:date", async (req, res) => {
  try {
    const { date } = req.params;
    const query = `SELECT * FROM box WHERE DATE(created_at) = "${date}"`;
    const data = await db.handleQuery(query);
    utils.sucessResponse(res, data, "success");
  } catch (e) {
    utils.errorReponse(res, 500, "Error en la conexión a la base de datos");
  }
});

boxRouter.post("/open", async (req, res) => {
  try {
    const { opening, status, user_creator } = req.body;
    const date = new Date().toISOString().slice(0, 19).replace("T", " ");

    const queryCreateBox = `INSERT INTO box (opening, ending, total_diff, user_creator, user_finished, created_at, updated_at, status) VALUES (${opening}, NULL, NULL, "${user_creator}", NULL, "${date}", "${date}", ${status})`;

    await db.handleQuery(queryCreateBox);
    utils.sucessResponse(res, [], "success");
  } catch (e) {
    utils.errorReponse(res, 500, "Error en la conexión a la base de datos");
  }
});

boxRouter.put("/to-close/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { ending, total_diff, user_finished } = req.body;
    const date = new Date().toISOString().slice(0, 19).replace("T", " ");
    const queryUpdated = `UPDATE box SET ending=${ending}, total_diff=${total_diff}, user_finished="${user_finished}", status=0, updated_at="${date}" WHERE id=${id}`;
    const data = await db.handleQuery(queryUpdated);
    utils.sucessResponse(res, data, "success");
  } catch (e) {
    utils.errorReponse(res, 500, "Error en la conexión a la base de datos");
  }
});

boxRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { opening, status, user_creator } = req.body;
    const date = new Date().toISOString().slice(0, 19).replace("T", " ");
    const queryUpdated = `UPDATE box SET opening=${opening}, user_creator="${user_creator}", ending=NULL, total_diff=NULL, user_finished=NULL, status=${status}, updated_at="${date}" WHERE id=${id}`;
    const data = await db.handleQuery(queryUpdated);
    utils.sucessResponse(res, data, "success");
  } catch (e) {
    utils.errorReponse(res, 500, "Error en la conexión a la base de datos");
  }
});

module.exports = boxRouter;
