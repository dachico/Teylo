const mongoose = require('mongoose');
require('dotenv').config();

const dbConfig = {
  url: process.env.MONGO_URI,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
};

module.exports = { dbConfig };