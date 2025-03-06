// // routes/nfts.js
// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const upload = multer(); // in-memory file storage

// // If you have a pinFileToIPFS utility:
// const { pinFileToIPFS } = require("../utils/pinata");

// // Example route for /api/nfts/uploadToIPFS
// router.post("/uploadToIPFS", upload.single("file"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }
//     const fileBuffer = req.file.buffer;
//     const fileName = req.file.originalname || "uploaded-file";

//     // Pin the file to IPFS (Pinata)
//     const result = await pinFileToIPFS(fileBuffer, fileName);

//     // result should have { IpfsHash, PinSize, Timestamp, ... }
//     return res.json(result);
//   } catch (error) {
//     console.error("Error uploading to IPFS:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // (Optional) other routes like GET / for listing NFTs
// router.get("/", async (req, res) => {
//   // For example:
//   // const allNFTs = ...
//   // res.json(allNFTs);
//   res.json([]);
// });

// module.exports = router;




// routes/nfts.js or server.js
const express = require("express");
const router = express.Router();
const { scanHiveForNFTs, getAllNFTs } = require("../hiveIndex");

router.get("/", async (req, res) => {
    try {
        console.log("Calling scanHiveForNFTs() in route...");
        await scanHiveForNFTs(); // the same function your test script calls
        const allNFTs = getAllNFTs();
        console.log("Returning NFTs from route:", allNFTs);
        res.json(allNFTs);
    } catch (error) {
        console.error("Error retrieving NFTs:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
