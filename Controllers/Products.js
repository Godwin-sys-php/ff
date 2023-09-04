const Produit = require("../Models/Produit");

exports.createProduct = async (req, res) => {
  try {
    const produit2Add = {
      nom: req.body.nom,
      prix: Number(req.body.prix),
    };

    await Produit.insertOne(produit2Add);

    return res.status(200).json({ create: true, });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Une erreur inconnu a eu lieu", });
  }
};

exports.getAll = async (req, res) => {
  try {
    const produits = await Produit.customQuery("SELECT * FROM produit", []);

    return res.status(200).json({ find: true, result: produits, });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: true, message: "Une erreur inconnu a eu lieu", });
  }
}

exports.getFromStock = async (req, res) => {
  try {
    const produits = await Produit.customQuery("SELECT p.id AS produitId, p.nom AS nom, sp.id as id, p.prix as prix, sp.quantite FROM produit p JOIN stockProduit sp ON p.id = sp.produitId WHERE sp.stockId = ?;", [Number(req.params.stockId)]);

    return res.status(200).json({ find: true, result: produits, });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: true, message: "Une erreur inconnu a eu lieu", });
  }
}