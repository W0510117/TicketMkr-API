const express = require("express");
const router = express.Router();
const { sql, config } = require("../db/sqlConfig");

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

    if (!eventId || !ticketCount || !customerName || !customerEmail) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const pool = await sql.connect(config);

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
