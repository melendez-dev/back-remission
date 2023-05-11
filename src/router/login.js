const express = require("express");
// database
const db = require("../connect/connection");
// utils
const utils = require("../utils/utils");
// login router const
const loginRouter = express.Router();

loginRouter.get("/", (req, res) => {
  res.send("login")
})

loginRouter.post("/", async (req, res) => {
  try {
    const { body } = req;
    res.send("ok")
    // if (!body.username || !body.password) {
    //   utils.errorReponse(res, 204, "Correo y/o contraseña requeridas");
    //   return;
    // }
    // const query = `SELECT id, username, rol FROM access WHERE username="${body.username}" and password="${body.password}"`;
    // const data = await db.handleQuery(query);
    // utils.sucessResponse(
    //   res,
    //   [],
    //   data?.length ? "success" : "no existe el usuario"
    // );
  } catch (e) {
    utils.errorReponse(res, 500, e);
  }
});

module.exports = loginRouter;
