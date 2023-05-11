const express = require("express");
// database
const db = require("../connect/connection");
// utils
const utils = require("../utils/utils");
// login router const
const loginRouter = express.Router();

loginRouter.post("/", async (req, res) => {
  try {
    const { body } = req;
    if (!body.hasOwnProperty("usernmae")|| !body.hasOwnProperty("password")) {
      utils.errorReponse(res, 204, "Debe enviarse el usuario y la contraseña")
      return;
    }
    const query = `SELECT id, username, rol FROM access WHERE username="${body.username}" and password="${body.password}"`;
    const data = await db.handleQuery(query);
    res.json({message: "success", data: data[0], status: "success"})
  } catch (e) {
    utils.errorReponse(res, 500, e);
  }
});

module.exports = loginRouter;
