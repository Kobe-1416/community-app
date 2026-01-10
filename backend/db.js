const { Pool } = require("pg");

const pool = new Pool({
    user: "devuser",
    host: "localhost",
    database: "devdb",
    password: "devpass",
    port: 5432,
});

pool.connect((err, client,release) => {
    if(err){
        console.error("Error connecting to the database", err.stack);
    }
    else{
        console.log("Connected to the database");
        release();
    }
});

module.exports = pool;