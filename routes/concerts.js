const express = require("express");
const router = express.Router();
const { sql, config } = require("../db/sqlConfig");

// GET all concerts
router.get("/", async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query(`SELECT * FROM Concerts`);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
});

module.exports = router;
