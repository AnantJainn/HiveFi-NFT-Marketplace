// testScan.js
const { scanHiveForNFTs, getAllNFTs } = require("./hiveIndex");

async function testHiveIndex() {
    console.log("Starting Hive indexer test...");
    await scanHiveForNFTs();
    const allNFTs = getAllNFTs();
    console.log("Final NFT store contents:");
    console.log(allNFTs);
}

testHiveIndex().catch((err) => {
    console.error("Error during testing:", err);
});
