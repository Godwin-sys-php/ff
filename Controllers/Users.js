const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Utilisateur = require('../Models/Utilisateur');

require('dotenv').config();

exports.login = (req, res) => {
  Utilisateur.find({ pseudo: req.body.username.toLowerCase() })
    .then((user) => {
      if (user.length < 1) {
        res.status(404).json({ pseudo: false, password: false, message: "Nom d'utilisateur incorrect" });
      } else {
        console.log(req.body.password);
        bcrypt.compare(req.body.password, user[0].motDePasse)
          .then((valid) => {
            if (!valid) {
              res.status(401).json({ pseudo: true, password: false, message: "Mot de passe incorrect" });
            } else {
              res.status(200).json({
                logged: true,
                id: user[0].id,
                user: user[0],
                token: jwt.sign({ id: user[0].id, }, process.env.TOKEN, {
                  expiresIn: "3d",
                })
              });
            }
          })
          .catch(error => {
            console.log(error);
            res.status(500).json({ error: true, errorMessage: error });
          });
      }
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({ error: true, message: "Une erreur inconu a eu lieu" });
    });
};