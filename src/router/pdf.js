const express = require("express");

// read file
const fs = require("fs");
const hbs = require("hbs");
const readFile = require("util").promisify(fs.readFile);
const htmlPDF = require("puppeteer-html-pdf");

// database
const db = require("../connect/connection");
// utils
const utils = require("../utils/utils");
// pdf router const
const pdfRouter = express.Router();

pdfRouter.get("/remission/:id", async (req, res) => {
  try {
    const { id } = req.params; // this id is of remission
    const pdfData = await getInfoRemissionPDF(id, req);
    const options = {
      format: "A4",
    };

    // using template
    const html = await readFile("src/views/remission.hbs", "utf8");
    const template = hbs.compile(html);
    const content = template(pdfData);
    const buffer = await htmlPDF.create(content, options);

    // res attachment
    res.attachment(`remission_${id}.pdf`);
    res.end(buffer);
  } catch (e) {
    utils.errorReponse(res, 500, e);
  }
});

pdfRouter.post("/box", async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const pdfData = await getInfoBoxAndItsMovement(startDate, endDate, req);
    const options = {
      format: "A4",
    };

    // using template
    const html = await readFile("src/views/box.hbs", "utf8");
    const template = hbs.compile(html);
    const content = template(pdfData);
    const buffer = await htmlPDF.create(content, options);

    // res attachment
    res.attachment(`box-${startDate}-${endDate}.pdf`);
    res.end(buffer);
  } catch (e) {
    utils.errorReponse(res, 500, e);
  }
});

// utils
const getInfoRemissionPDF = async (id, req) => {
  const querySelectRemission = `SELECT * FROM remission WHERE id=${id}`;
  const dataRemission = await db.handleQuery(querySelectRemission);

  if (Array.isArray(dataRemission) && dataRemission?.length > 0) {
    const querySelectUser = `SELECT * FROM user WHERE identy="${dataRemission[0]["identy_user"]}"`;
    const dataUser = await db.handleQuery(querySelectUser);
    if (Array.isArray(dataUser) && dataUser?.length > 0) {
      const codesProducts = dataRemission[0]["code_product"]?.split(",");
      const dataProducts = [];
      let total = 0;
      const statusRemisson = ["completado", "pendiente", "cancelado"];
      const paymentMethod = [
        "efectivo (pago directo)",
        "Bancolombia (pago directo)",
        "Nequi (pago directo)",
        "Daviplata (pago directo)",
        "tarjeta",
      ];
      for (let product of codesProducts) {
        if (product) {
          const querySelectProduct = `SELECT * FROM product WHERE code = ${product}`;
          const result = await db.handleQuery(querySelectProduct);
          dataProducts.push(result[0]);
          if (Array.isArray(result) && result.length > 0) {
            total += parseFloat(result[0]?.price);
          }
        }
      }
      if (dataProducts.length > 0) {
        // convert format cop
        for (let product of dataProducts) {
          product["price"] = parseInt(product["price"]).toLocaleString(
            "es-CO",
            { style: "currency", currency: "COP" }
          );
        }
      }

      const pdfData = {
        dataUser: dataUser[0],
        dataRemission: dataRemission[0],
        dataProducts,
        baseUrl: `${req.protocol}://${req.get("host")}`, // http://localhost:3001 or the server host
      };
      pdfData["dataRemission"]["day"] = new Date(
        dataRemission[0].created_at
      ).getDate();
      pdfData["dataRemission"]["month"] =
        new Date(dataRemission[0].created_at).getMonth() + 1;
      pdfData["dataRemission"]["year"] = new Date(
        dataRemission[0].created_at
      ).getFullYear();
      pdfData["dataRemission"]["payment_method"] = dataRemission[0]
        ?.payment_method
        ? paymentMethod[parseInt(dataRemission[0]?.payment_method) - 1]
        : "Aún no definido";
      pdfData["dataRemission"]["status_remission"] =
        statusRemisson[parseInt(dataRemission[0]?.status) - 1];
      pdfData["dataRemission"]["total_amount"] = total.toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
      });

      return pdfData;
    }
  }
};

const getInfoBoxAndItsMovement = async (startDate, endDate, req) => {
  const pdfData = {
    baseUrl: `${req.protocol}://${req.get("host")}`, // http://localhost:3001 or the server host
  };

  const queryGetBoxByDate = `SELECT * FROM box WHERE DATE(created_at) BETWEEN STR_TO_DATE("${startDate}", '%Y-%m-%d') AND STR_TO_DATE("${endDate}", '%Y-%m-%d');`;
  const dataGetBoxByDate = await db.handleQuery(queryGetBoxByDate);

  let arrayData = [];

  let arrayyMethod = [
    "Efectivo",
    "Bancolombia",
    "Nequi",
    "Daviplata",
    "Tarjeta",
  ];

  let nameMovement = ["Ingreso", "Egreso"];

  if (Array?.isArray(dataGetBoxByDate) && dataGetBoxByDate?.length > 0) {
    for (const dataBox of dataGetBoxByDate) {
      if (dataBox?.id) {
        const queryBoxMovement = `SELECT * FROM box_movement WHERE id_box=${dataBox?.id}`;
        const dataBoxMovements = await db.handleQuery(queryBoxMovement);

        dataBox["created_at"] = dataBox["created_at"].substring(0, 10); // format timestamp

        // format box opening and ending
        dataBox["opening"] = dataBox["opening"].toLocaleString("es-CO", {
          style: "currency",
          currency: "COP",
        });

        dataBox["ending"] = dataBox["ending"].toLocaleString("es-CO", {
          style: "currency",
          currency: "COP",
        });

        dataBox["total_diff"] = dataBox["total_diff"].toLocaleString("es-CO", {
          style: "currency",
          currency: "COP",
        });

        if (Array.isArray(dataBoxMovements) && dataBoxMovements?.length > 0) {
          for (const dataMovement of dataBoxMovements) {
            dataMovement["price"] = dataMovement["price"].toLocaleString(
              "es-CO",
              {
                style: "currency",
                currency: "COP",
              }
            );
            if (dataMovement["type_income"]) {
              dataMovement["type_income"] =
                arrayyMethod[parseInt(dataMovement["type_income"]) - 1];
            }
            dataMovement["type"] =
              nameMovement[parseInt(dataMovement["type"]) - 1];

            dataMovement["created_at"] = dataMovement["created_at"].replace(/T|\.000Z/g, " ").slice(0, -4)

            dataMovement["type_color"] = dataMovement["type_income"] ? "incomes" : "outcomes"

            console.log({dataMovement})
          }
          dataBox["movements"] = dataBoxMovements;
          arrayData.push(dataBox);
        }
      }
    }
  }

  pdfData["dataBox"] = arrayData;

  return pdfData;
};

module.exports = pdfRouter;
