const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser')
const cors = require('cors')
const limit = require("express-rate-limit")

require('dotenv').config();

const app = express()
const port = 4200


const server = require('http').Server(app);

app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use(morgan('dev'))
app.use(cors())


app.use(limit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 200, // 200 request
  message: {
    toManyRequest: true,
  }
}))

app.use('/users', require('./Routes/Users'))
app.use('/clients', require('./Routes/Clients'))
app.use('/products', require('./Routes/Products'))
app.use('/stocks', require('./Routes/Stocks'))
app.use('/sessions', require('./Routes/Sessions'))

app.use('/Invoices', express.static(__dirname + '/Invoices'));

server.listen(port, function () {
  console.debug(`listening on port ${port}`);
});