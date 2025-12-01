require("dotenv").config();
const express = require("express");
const cors = require("cors");

const concertsRouter = require("./routes/concerts");
const purchasesRouter = require("./routes/purchases");

const app = express();

app.use(cors());
app.use(express.json());

// concerts API
app.use("/api/concerts", concertsRouter);

// purchases API
app.use("/api/purchases", purchasesRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
});
