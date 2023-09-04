const moment = require("moment");
const Vente = require("../Models/Vente");
const ProduitVente = require("../Models/ProduitVente");
const StockProduit = require("../Models/StockProduit");
const Produit = require("../Models/Produit");
const Client = require("../Models/Client");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const pdf = require("html-pdf");

exports.createSession = async (req, res) => {
  try {
    const now = moment();
    const { clientId } = req.body;
    const client = await Client.find({ id: clientId });
    const toInsert = {
      clientId: clientId,
      nameOfClient: client[0].nom,
      stockId: null,
      utilisateurId: null,
      dateHeure: now.unix(),
      total: 0,
      reduction: 0,
      fraisLivraison: 0,
      status: "first",
      taux: 2400,
      livreur: "",
      adresse: "",
      done: 0,
    };

    await Vente.insertOne(toInsert);

    return res.status(200).json({ create: true });
  } catch (error) {
    return res.status(500).json({ error: true });
  }
};

exports.getNotDone = async (req, res) => {
  try {
    const sessions = await Vente.customQuery(
      "SELECT * FROM vente WHERE status != 'payed'"
    );
    return res.status(200).json({ find: true, result: sessions.reverse() });
  } catch (error) {
    return res.status(500).json({ error: true });
  }
};

exports.getOne = async (req, res) => {
  try {
    const session = await Vente.find({ id: req.params.id });
    if (session.length === 0) {
      return res.status(404).json({ error: true, message: "Introuvable" });
    }
    //const items = await ProduitVente.find({ venteId: req.params.id, });
    const items = await ProduitVente.customQuery(
      "SELECT pv.prix as prix, pv.quantite as quantite, pv.id as id, p.nom as name from produitVente pv JOIN produit p ON pv.produitId = p.id WHERE pv.venteId = ?",
      [req.params.id]
    );
    return res
      .status(200)
      .json({ find: true, result: { ...session[0], items: items } });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: true });
  }
};

exports.generateBill = async (req, res) => {
  try {
    const session = await Vente.find({ id: req.params.id });
    if (session.length === 0) {
      return res.status(404).json({ error: true, message: "Introuvable" });
    }
    //const items = await ProduitVente.find({ venteId: req.params.id, });
    const items = await ProduitVente.customQuery(
      "SELECT pv.prix as prix, pv.quantite as quantite, pv.id as id, p.nom as name from produitVente pv JOIN produit p ON pv.produitId = p.id WHERE pv.venteId = ?",
      [req.params.id]
    );
    const number = fs.readFileSync(
      path.join(__dirname, "../Invoices/", "number.txt"),
      "utf-8"
    );
    const now2 = moment().utcOffset(1);

    const code = now2.format("YYYYMM") + "-" + number;

    const now = moment();

    const totalGeneral =
      Number(session[0].total) -
      Number(session[0].reduction) +
      Number(session[0].fraisLivraison);
    const data = {
      data: {
        number: code,
        date: now.format("DD/MM/yyyy"),
        client: session[0].nameOfClient,
        item: items,
        total: session[0].total,
        livreur: session[0].livreur,
        adresse: session[0].adresse,
        reduction: session[0].reduction,
        fees: session[0].fraisLivraison,
        totalGeneral: totalGeneral,
        dollar: Math.round((totalGeneral / session[0].taux) * 100) / 100,
      },
    };

    ejs.renderFile(
      path.join(__dirname, "../Assets/", "bill.ejs"),
      data,
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          let options = {
            childProcessOptions: {
              env: {
                OPENSSL_CONF: "/dev/null",
              },
            },
            width: "7.5cm",
            localUrlAccess: true,
          };

          const nameOfFile = `Facture_${code}_${session[0].nameOfClient}.pdf`;
          pdf

            .create(data, options)
            .toFile(`Invoices/${nameOfFile}`, (err, data) => {
              if (err) {
                console.log(err);
              } else {
                console.log("hey");

                fs.writeFile(
                  path.join(__dirname, "../Invoices/", "number.txt"),
                  `${Number(number) + 1}`,
                  "utf8",
                  () => {
                    res.status(200).json({ update: true });
                  }
                );
                res
                  .status(200)
                  .json({
                    url: `http://147.182.240.60/Invoices/${nameOfFile}`,
                  });
              }
            });
        }
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: true });
  }
};

exports.edit = async (req, res) => {
  try {
    const { taux, livreur, adresse, fraisLivraison } = req.body;
    const vente = await Vente.find({ id: req.params.id });
    if (vente.length === 0) {
      return res
        .status(500)
        .json({ error: true, message: "Une erreur inconnu a eu lieu" });
    }
    await Vente.updateOne(
      {
        taux: Number(taux),
        livreur: livreur,
        adresse: adresse,
        fraisLivraison: Number(fraisLivraison),
      },
      { id: req.params.id }
    );
    return res.status(200).json({ update: true });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Une erreur inconnu a eu lieu" });
  }
};

exports.addProduct2Session = async (req, res) => {
  try {
    const product = await StockProduit.find({ id: req.body.productId });
    if (product[0].stockId != req.body.stockId) {
      return res
        .status(500)
        .json({ error: true, message: "Une erreur inconnu a eu lieu" });
    }
    if (product[0].quantite == Number(req.body.quantite)) {
      await StockProduit.deleteOne({ id: product[0].id });
      const productData = await Produit.find({ id: product[0].produitId });
      const sessionData = await Vente.find({ id: req.params.id });
      const toInsertProduct = {
        venteId: req.params.id,
        stockId: req.body.stockId,
        produitId: product[0].produitId,
        prix: productData[0].prix,
        quantite: Number(req.body.quantite),
      };
      await ProduitVente.insertOne(toInsertProduct);
      await Vente.updateOne(
        {
          total:
            sessionData[0].total +
            Number(req.body.quantite) * Number(productData[0].prix),
        },
        { id: req.params.id }
      );
      return res.status(200).json({ create: true });
    } else if (product[0].quantite > Number(req.body.quantite)) {
      await StockProduit.updateOne(
        { quantite: product[0].quantite - Number(req.body.quantite) },
        { id: product[0].id }
      );
      const productData = await Produit.find({ id: product[0].produitId });
      const sessionData = await Vente.find({ id: req.params.id });
      const toInsertProduct = {
        venteId: req.params.id,
        stockId: req.body.stockId,
        produitId: product[0].produitId,
        prix: productData[0].prix,
        quantite: Number(req.body.quantite),
      };
      await ProduitVente.insertOne(toInsertProduct);
      await Vente.updateOne(
        {
          total:
            sessionData[0].total +
            Number(req.body.quantite) * productData[0].prix,
        },
        { id: req.params.id }
      );
      return res.status(200).json({ create: true });
    } else {
      return res
        .status(500)
        .json({ error: true, message: "Une erreur inconnu a eu lieu" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: true, message: "Une erreur inconnue a eu lieu," });
  }
};

exports.removeOneProduct = async (req, res) => {
  try {
    const item = await ProduitVente.find({ id: req.params.id });
    if (item.length === 0) {
      return res
        .status(500)
        .json({ error: true, message: "Une erreur inconnue a eu lieu," });
    }
    const stockId = item[0].stockId;
    const produitId = item[0].produitId;
    const quantite = item[0].quantite;
    const prix = item[0].prix;
    let stockProduit = await StockProduit.find({ stockId: stockId });
    let newStockProduit = [];
    for (let index in stockProduit) {
      newStockProduit[index] = stockProduit[index].produitId;
    }
    if (newStockProduit.includes(Number(produitId))) {
      const index = newStockProduit.indexOf(Number(produitId));
      await StockProduit.updateOne(
        { quantite: stockProduit[index].quantite + Number(quantite) },
        { id: stockProduit[index].id }
      );
      await ProduitVente.deleteOne({ id: req.params.id });
      const vente = await Vente.find({ id: item[0].venteId });
      await Vente.updateOne(
        { total: vente[0].total - prix * quantite },
        { id: item[0].venteId }
      );
      return res.status(200).json({ delete: true });
    } else {
      let toInsert = {
        stockId: Number(stockId),
        produitId: Number(produitId),
        quantite: Number(quantite),
      };

      await StockProduit.insertOne(toInsert);
      await ProduitVente.deleteOne({ id: req.params.id });
      const vente = await Vente.find({ id: item[0].venteId });
      await Vente.updateOne(
        { total: vente[0].total - prix * quantite },
        { id: item[0].venteId }
      );
      return res.status(200).json({ delete: true });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: true, message: "Une erreur inconnue a eu lieu," });
  }
};

exports.changePrice = async (req, res) => {
  try {
    const item = await ProduitVente.find({ id: req.params.id });
    if (item.length === 0) {
      return res
        .status(500)
        .json({ error: true, message: "Une erreur inconnue a eu lieu," });
    }
    await ProduitVente.updateOne(
      { prix: req.body.price },
      { id: req.params.id }
    );
    const sum = await ProduitVente.customQuery(
      "SELECT SUM(quantite * prix) as sum FROM produitVente WHERE venteId = ?",
      [item[0].venteId]
    );

    await Vente.updateOne({ total: sum[0].sum }, { id: item[0].venteId });
    return res.status(200).json({ update: true });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: true, message: "Une erreur inconnue a eu lieu," });
  }
};

exports.changeStatus = async (req, res) => {
  try {
    let nextStatus = null;
    switch (req.body.status) {
      case "first":
        nextStatus = "live";
        break;
      case "live":
        nextStatus = "delivering";
        break;
      case "delivering":
        nextStatus = "done";
        break;
      case "done":
        nextStatus = "payed";
        break;
    }
    await Vente.updateOne({ status: nextStatus }, { id: req.params.id });
    return res.status(200).json({ update: true });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Une erreur inconnue a eu lieu" });
  }
};
