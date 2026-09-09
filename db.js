//npm i mysql2
const mysql = require("mysql2/promise")

const pool = mysql.createPool({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'escola',
    database: 'pninik2tri3dsb'
})

module.exports = Object.freeze({
    pool:pool
})