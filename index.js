const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// CONST
const PORT = 3001;

// import routers
const loginRouter = require('./src/router/login');
//const uploadRouter = require('./src/router/upload');
const usersRouter = require('./src/router/users');
const productsRouter = require('./src/router/products');
const remissionRouter = require('./src/router/remission');
const pdfRouter = require('./src/router/pdf');
const boxRouter = require('./src/router/box');
const boxMovementRouter = require('./src/router/box_movement');

// import middleware
//const middlewareHeaders = require('./src/middlewares/headers.js');

// create app
const app = express();

app.use(cors({
    origin: '*'
}));

// middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


//app.use(express.static('public')); // static image
//app.set('view engine', 'hbs'); // allow hbs files


// http request
//app.use((req, res, next) => middlewareHeaders(req, res, next)) // validate headers
//app.use('/login', loginRouter);
//app.use('/upload', uploadRouter);
//app.use('/users', usersRouter);
//app.use('/products', productsRouter)
//app.use('/remissions', remissionRouter)
//app.use('/pdf', pdfRouter)
//app.use('/box', boxRouter)
//app.use('/box_movement', boxMovementRouter)

app.post("/login", async (req, res) => {
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

// listen
app.listen(PORT)