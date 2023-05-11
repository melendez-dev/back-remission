const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// CONST
const PORT = 3001;

// import routers
// const loginRouter = require('./src/router/login.js');
// const uploadRouter = require('./src/router/upload.js');
// const usersRouter = require('./src/router/users.js');
// const productsRouter = require('./src/router/products.js');
// const remissionRouter = require('./src/router/remission.js');
// const pdfRouter = require('./src/router/pdf.js');
// const boxRouter = require('./src/router/box.js');
// const boxMovementRouter = require('./src/router/box_movement.js');

// import middleware
// const middlewareHeaders = require('./src/middlewares/headers.js');

// create app
const app = express();

// middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
    origin: "*"
}));

//app.use((req, res, next) => middlewareHeaders(req, res, next)) // validate headers
app.use(express.static('public')); // static image
app.set('view engine', 'hbs'); // allow hbs files


// http request
// app.use('/login', loginRouter);
// app.use('/upload', uploadRouter);
// app.use('/users', usersRouter);
// app.use('/products', productsRouter)
// app.use('/remissions', remissionRouter)
// app.use('/pdf', pdfRouter)
// app.use('/box', boxRouter)
// app.use('/box_movement', boxMovementRouter)

app.get("/", (req, res) => res.send("ok"))

// listen
app.listen(PORT)