const StockProduit = require("../Models/StockProduit");
const Stock = require("../Models/Stock");

exports.createStock = async (req, res) => {
  try {
    const stock2add = {
      nom: req.body.nom,
      type: (req.body.type),
    };

    await Stock.insertOne(stock2add);

    return res.status(200).json({ create: true, });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Une erreur inconnu a eu lieu", });
  }
};

exports.getOne = async (req, res) => {
  try {
    const stock = await Stock.find({ id: req.params.id, });
    const products = await StockProduit.customQuery("SELECT sp.stockId, p.nom AS produitNom, p.prix as price, sp.quantite as quantite FROM stockProduit sp JOIN produit p ON sp.produitId = p.id WHERE sp.stockId = ?", [req.params.id]);

    return res.status(200).json({ find: true, result: {...stock[0], products: products,} });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Une erreur inconnu a eu lieu", });
  }
}

exports.appro = async (req, res) => {
  try {
    let stockProduit = await StockProduit.find({ stockId: req.params.id, });
    let newStockProduit = [];
    for (let index in stockProduit) {
      newStockProduit[index] = stockProduit[index].produitId;
    }
    if (newStockProduit.includes(Number(req.body.produitId))) {
      const index = newStockProduit.indexOf(Number(req.body.produitId));
      await StockProduit.updateOne({ quantite: stockProduit[index].quantite + Number(req.body.quantite), }, { id: stockProduit[index].id, });
      return res.status(200).json({ create: true, });
    } else {
      let toInsert = {
        stockId: Number(req.params.id),
        produitId: Number(req.body.produitId),
        quantite: Number(req.body.quantite),
      }

      await StockProduit.insertOne(toInsert);
      return res.status(200).json({ create: true, });
    }
  } catch (error) {
    return res.status(500).json({ error: true, message: "Une erreur inconnu a eu lieu", });
  }
}

exports.remove = async (req, res) => {
  try {
    const product = await StockProduit.find({ id: req.body.id, });
    if (product[0].stockId != req.params.id) {
      console.log(product);
      console.log(req.params);
      return res.status(500).json({ error: true, message: "Une erreur inconnu a eu lieu", });
    }
    if (product[0].quantite == Number(req.body.quantite)) {
      await StockProduit.deleteOne({ id: product[0].id, }) ;
      return res.status(200).json({ update: true, });
    } else if (product[0].quantite > Number(req.body.quantite)) {
      await StockProduit.updateOne({ quantite: product[0].quantite - Number(req.body.quantite), }, { id: product[0].id, });
      return res.status(200).json({ update: true, });
    } else {
      return res.status(500).json({ error: true, message: "Une erreur inconnu a eu lieu", });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: true, message: "Une erreur inconnu a eu lieu", });
  }
}

exports.transfer = async (req, res) => {
  try {
    const product = await StockProduit.find({ id: req.body.id, });
    if (product[0].stockId != req.params.fromId) {
      console.log(product);
      console.log(req.params);
      return res.status(500).json({ error: true, message: "Une erreur inconnu a eu lieu", });
    }
    if (product[0].quantite == Number(req.body.quantite)) {
      await StockProduit.deleteOne({ id: product[0].id, }) ;
      return res.status(200).json({ update: true, });
    } else if (product[0].quantite > Number(req.body.quantite)) {
      await StockProduit.updateOne({ quantite: product[0].quantite - Number(req.body.quantite), }, { id: product[0].id, });
      let stockProduit = await StockProduit.find({ stockId: req.params.toId, });
      let newStockProduit = [];
      for (let index in stockProduit) {
        newStockProduit[index] = stockProduit[index].produitId;
      }
      if (newStockProduit.includes(Number(product[0].produitId))) {
        const index = newStockProduit.indexOf(Number(product[0].produitId));
        await StockProduit.updateOne({ quantite: stockProduit[index].quantite + Number(req.body.quantite), }, { id: stockProduit[index].id, });
        return res.status(200).json({ update: true, });
      } else {
        let toInsert = {
          stockId: Number(req.params.toId),
          produitId: Number(product[0].produitId),
          quantite: Number(req.body.quantite),
        }
  
        await StockProduit.insertOne(toInsert);
        return res.status(200).json({ update: true, });
      }
    } else {
      return res.status(500).json({ error: true, message: "Une erreur inconnu a eu lieu", });
    }

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: true, message: "Une erreur inconnu a eu lieu", });
  }
}

exports.getAll = async (req, res) => {
  try {
    const stocks = await Stock.customQuery("SELECT * FROM stock ORDER BY type", []);
    let newArr = []
    for (index in stocks) {
      const nbreOfProduct = await Stock.customQuery("SELECT DISTINCT COUNT(*) as value FROM stockProduit WHERE stockId = ?", [stocks[index].id]);
      const total = await Stock.customQuery("SELECT SUM(quantite) as value FROM stockProduit WHERE stockId = ?", [stocks[index].id]);
      const stockValue = await Stock.customQuery("SELECT SUM(p.prix * sp.quantite) AS value FROM stock AS s JOIN stockProduit AS sp ON s.id = sp.stockId JOIN produit AS p ON sp.produitId = p.id WHERE s.id = ? GROUP BY s.nom", [stocks[index].id]);
      const products = await StockProduit.customQuery("SELECT sp.id as id, sp.stockId as stockId, p.nom AS name, p.prix as price, sp.quantite as quantite FROM stockProduit sp JOIN produit p ON sp.produitId = p.id WHERE sp.stockId = ?", [stocks[index].id]);
      newArr.push({ ...stocks[index], products: products, nbreOfProduct:nbreOfProduct[0] ? nbreOfProduct[0]?.value : 0, total: total[0] ? total[0]?.value : 0, stockValue: stockValue[0] ? stockValue[0]?.value : 0, });
    }

    return res.status(200).json({ find: true, result: newArr, });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: true, message: "Une erreur inconnu a eu lieu", });
  }
}