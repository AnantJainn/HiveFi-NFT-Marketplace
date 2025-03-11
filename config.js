module.exports = {
  // Pinata credentials (get from your Pinata account)
  PINATA_API_KEY: "8ed5bd40422ba8369083",
  PINATA_SECRET_API_KEY:
    "4c0ebac4ea4568dc76d1166a44d0f11ce8bcdbd18ca6a6c4fb8a1a005eb537d6",

  // Hive API nodes
  HIVE_NODES: ["https://api.hive.blog", "https://api.openhive.network"],

  // For indexing:
  // A list of accounts you want to scan, or handle scanning entire chain (see hiveIndex.js)
  SCAN_ACCOUNTS: [
    "anantjain",
    "shubhangimishra",
    "shikharhive",
    "gauranshigupta",
  ],

  // The custom JSON ID used for your NFT ops
  NFT_CUSTOM_JSON_ID: "HiveFi_nft",
  // The custom JSON ID used for NFT sales
  NFT_SALE_JSON_ID: "HiveFi_nft_sale",

  NFT_VOTE_JSON_ID: "HiveFi_vote",
};
