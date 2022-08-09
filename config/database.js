const mysql = require('mysql');
const databaseConstant = require('../constant/databaseConstant');


const conn = mysql.createConnection({
    host: databaseConstant.HOST,
    port: databaseConstant.PORT,
    user: databaseConstant.USER,
    password: databaseConstant.PASSWORD,
    database: databaseConstant.DATABASE_NAME
});

conn.connect((err) =>{
    if(err) throw err;
    console.log('Mysql Connected with App...');
});

module.exports = conn;