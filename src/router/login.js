const express = require("express");
// database
const db = require("../connect/connection");
// utils
const utils = require("../utils/utils");
// login router const
const loginRouter = express.Router();

loginRouter.post("/", async (req, res) => {
  try {
    //const { body } = req;
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    // another common pattern
    // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    )
    res.send("not is vercel is the connection db")
    // return
    // if (!body.hasOwnProperty("username")|| !body.hasOwnProperty("password")) {
    //   utils.errorReponse(res, 204, "Debe enviarse el usuario y la contraseña")
    //   return;
    // }
    // const query = `SELECT id, username, rol FROM access WHERE username="${body.username}" and password="${body.password}"`;
    // const data = await db.handleQuery(query);
    // res.json({message: "success", data: data[0], status: "success"})
  } catch (e) {
    utils.errorReponse(res, 500, e);
  }
});

module.exports = loginRouter;
