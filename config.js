const dotenv = require("dotenv");
dotenv.config();
const config = {
  port: process.env.PORT || 4000,
};

module.exports = config;
