const express = require("express");
const router = express.Router();
const { sql, config } = require("../db/sqlConfig");

//GET /purchases

//get all purchases
router.get("/", async (req, res) => {
    try {
        const pool = await sql.connect(config);

        const result = await pool.request().query(`
            SELECT 
                p.PurchaseId,
                p.EventId,
                c.Title AS EventName,
                p.TicketCount,
                p.CustomerName,
                p.CustomerEmail,
                p.CreditCardNumber,
                p.Expiration,
                p.CVV
            FROM Purchases p
            LEFT JOIN Concerts c ON p.EventId = c.EventId
            ORDER BY p.PurchaseId DESC
        `);

        res.json(result.recordset);

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Database error" });
    }
});


//POST /purchases

//create a new purchase
router.post("/", async (req, res) => {

    const {
        eventId,
        ticketCount,
        customerName,
        customerEmail,
        creditCardNumber,
        expiration,
        cvv
    } = req.body;

    // ============ FIELD PRESENCE CHECKS {} ============
    if (!eventId || !ticketCount || !customerName || !customerEmail ||
        !creditCardNumber || !expiration || !cvv) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // ============ FORMAT CHECKS ============

    if (typeof eventId !== "number") {
        return res.status(400).json({ error: "eventId must be a number" });
    }

    if (typeof ticketCount !== "number" || ticketCount <= 0) {
        return res.status(400).json({ error: "ticketCount must be a positive number" });
    }

    if (!customerEmail.includes("@")) {
        return res.status(400).json({ error: "Invalid email format" });
    }

    if (creditCardNumber.length < 13 || creditCardNumber.length > 19) {
        return res.status(400).json({ error: "Invalid credit card number" });
    }

    if (!/^\d{3,4}$/.test(cvv)) {
        return res.status(400).json({ error: "CVV must be 3 or 4 digits" });
    }

    if (!/^\d{2}\/\d{2}$/.test(expiration)) {
        return res.status(400).json({ error: "Expiration must follow MM/YY" });
    }

    try {
        const pool = await sql.connect(config);

        // ============ CHECK IF EVENT EXISTS ============
        const checkEvent = await pool.request()
            .input("EventId", sql.Int, eventId)
            .query("SELECT * FROM Concerts WHERE EventId = @EventId");

        if (checkEvent.recordset.length === 0) {
            return res.status(404).json({ error: "Event does not exist" });
        }

        // ============ INSERT PURCHASE ============
        await pool.request()
            .input("EventId", sql.Int, eventId)
            .input("TicketCount", sql.Int, ticketCount)
            .input("CustomerName", sql.VarChar(100), customerName)
            .input("CustomerEmail", sql.VarChar(100), customerEmail)
            .input("CreditCardNumber", sql.VarChar(20), creditCardNumber)
            .input("Expiration", sql.VarChar(10), expiration)
            .input("CVV", sql.VarChar(5), cvv)
            .query(`
                INSERT INTO Purchases 
                (EventId, TicketCount, CustomerName, CustomerEmail, CreditCardNumber, Expiration, CVV)
                VALUES 
                (@EventId, @TicketCount, @CustomerName, @CustomerEmail, @CreditCardNumber, @Expiration, @CVV)
            `);

        res.status(201).json({ message: "Purchase recorded successfully" });

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Database error" });
    }
});


module.exports = router;
