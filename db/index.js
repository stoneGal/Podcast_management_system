const {Client} = require('pg');
require('dotenv').config();

const client = new Client ({

    database: process.env.DATABASE_NAME, 
    password: process.env.PASSWORD,
    host :process.env.HOST,
    user : process.env.USER,
    port :process.env.PORT,

    
});
client.connect();


module.exports = client;