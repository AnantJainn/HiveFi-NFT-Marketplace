const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const nftRoutes = require("./routes/nfts");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve front-end from 'public'
app.use(express.static(path.join(__dirname, "public")));

// Register the /api/nfts routes
// const nftRoutes = require("./routes/nfts");

app.use("/api/nfts", nftRoutes);


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
