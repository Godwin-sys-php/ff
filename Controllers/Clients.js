const Client = require("../Models/Client");

exports.createClient = async (req, res) => {
  try {
    const client2add = {
      nom: req.body.nom,
      adresse: req.body.adresse,
      telephone: req.body.telephone,
    };

    await Client.insertOne(client2add);

    return res.status(200).json({ create: true, });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Une erreur inconnu a eu lieu", });
  }
};

exports.getAll = async (req, res) => {
  try {
    const clients = await Client.customQuery("SELECT * FROM client", []);

    return res.status(200).json({ find: true, result: clients, });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: true, message: "Une erreur inconnu a eu lieu", });
  }
}