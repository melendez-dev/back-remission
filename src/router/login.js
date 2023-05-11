const express = require("express");
// database
const db = require("../connect/connection");
// utils
const utils = require("../utils/utils");
// login router const
const loginRouter = express.Router();

loginRouter.get("/", async(req, res) => {
  res.send("ok")
  // try{
  //   const query = `SELECT id, username, rol FROM access WHERE username="root@ltsystem.com"`;
  //   const data = await db.handleQuery(query);
  //   res.json({message: "success", data: data[0], status: "success"})
  // }catch(e){
  //   res.json({error: e})
  // }
})

loginRouter.post("/", async (req, res) => {
  try {
    const { body } = req;
    if (!body?.username || !body?.password) {
      utils.errorReponse(res, 204, "Correo y/o contraseña requeridas");
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
