const express = require("express");
const router = express.Router();
const { sql, config } = require("../db/sqlConfig");

// GET all concerts
router.get("/", async (req, res) => {
    try {
        const pool = await sql.connect(config);

        const result = await pool.request()
            .query(`
                SELECT 
                    c.EventId,
                    c.Title,
                    c.Description,
                    c.EventDateTime,
                    c.RecordDateTime,
                    c.ImageUpload,
                    cat.CategoryName,
                    loc.LocationName,
                    own.OwnerName
                FROM Concerts c
                JOIN Categories cat ON c.CategoryId = cat.CategoryId
                JOIN Locations loc ON c.LocationId = loc.LocationId
                JOIN Owners own ON c.OwnerId = own.OwnerId
                WHERE c.EventDateTime >= GETDATE();
            `);

        res.json(result.recordset);

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Database error" });
    }
});

module.exports = router;
