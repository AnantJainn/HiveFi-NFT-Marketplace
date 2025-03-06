// const dhive = require("@hiveio/dhive");
// const {
//     HIVE_NODES,
//     SCAN_ACCOUNTS,
//     NFT_CUSTOM_JSON_ID,
//     NFT_SALE_JSON_ID
// } = require("./config");

// // In-memory store for NFTs; in production, consider using a persistent database.
// let nftStore = [];

// // Create a Hive client using your configured nodes.
// const client = new dhive.Client(HIVE_NODES);

// /**
//  * Scans the last 1000 operations for each account in SCAN_ACCOUNTS
//  * and updates our in-memory NFT list.
//  */
// async function scanHiveForNFTs() {
//     // Clear the current store on each scan to avoid stale data.
//     nftStore = [];

//     let updatedNFTs = [];

//     for (const account of SCAN_ACCOUNTS) {
//         try {
//             console.log(`Scanning account "${account}" for NFT ops...`);
//             // Using limit 1000 as the maximum allowed by Hive API.
//             const history = await client.database.getAccountHistory(account, -1, 1000);
//             console.log(`Fetched ${history.length} operations for account "${account}"`);

//             history.forEach(([, operation]) => {
//                 const op = operation.op;
//                 if (op[0] === "custom_json") {
//                     const { id, json } = op[1];
//                     console.log(`Found custom_json with id: ${id} in account "${account}"`);
//                     if (id === NFT_CUSTOM_JSON_ID || id === NFT_SALE_JSON_ID) {
//                         try {
//                             const parsed = JSON.parse(json);
//                             console.log(`Parsed NFT op from "${account}":`, parsed);
//                             updatedNFTs.push(parsed);
//                         } catch (err) {
//                             console.error("Error parsing custom_json from", account, ":", err);
//                         }
//                     }
//                 }
//             });
//             console.log(`Account "${account}": Total NFT ops found so far: ${updatedNFTs.length}`);
//         } catch (error) {
//             console.error(`Error fetching account history for ${account}:`, error.message);
//         }
//     }

//     console.log(`Total parsed NFT ops before merging: ${updatedNFTs.length}`);
//     mergeNFTData(updatedNFTs);
//     console.log(`NFT store size after merge: ${nftStore.length}`);
// }

// /**
//  * Merges new NFT data into our in-memory store.
//  * If no unique key exists (permlink or nftId), a fallback key is generated.
//  */
// function mergeNFTData(updatedNFTs) {
//     updatedNFTs.forEach(nft => {
//         // Use permlink or nftId; if missing, generate a fallback unique key.
//         let uniqueKey = nft.permlink || nft.nftId;
//         if (!uniqueKey) {
//             console.warn("NFT object missing unique key (permlink/nftId):", nft);
//             uniqueKey = nft._fallbackKey || `fallback-${Date.now()}-${Math.random()}`;
//             nft._fallbackKey = uniqueKey;
//         }
//         const existingIndex = nftStore.findIndex(
//             item => (item.permlink || item.nftId || item._fallbackKey) === uniqueKey
//         );
//         if (existingIndex === -1) {
//             nftStore.push(nft);
//         } else {
//             nftStore[existingIndex] = { ...nftStore[existingIndex], ...nft };
//         }
//     });
// }

// /**
//  * Returns all NFTs in the in-memory store.
//  */
// function getAllNFTs() {
//     console.log("Returning NFT store with", nftStore.length, "items");
//     return nftStore;
// }

// module.exports = {
//     scanHiveForNFTs,
//     getAllNFTs
// };






// hiveIndex.js
const dhive = require("@hiveio/dhive");
const {
    HIVE_NODES,
    SCAN_ACCOUNTS,
    NFT_CUSTOM_JSON_ID,
    NFT_SALE_JSON_ID,
    NFT_VOTE_JSON_ID
} = require("./config");

// In-memory store of all NFTs
let nftStore = [];

// Create a Hive client using your configured nodes
const client = new dhive.Client(HIVE_NODES);

/**
 * Scans the last 1000 operations for each account in SCAN_ACCOUNTS
 * and updates our in-memory NFT list, including "likes" from safecase_vote ops.
 */
async function scanHiveForNFTs() {
    // Clear store each time to avoid duplicates (optional design choice)
    nftStore = [];

    let updatedOps = [];

    for (const account of SCAN_ACCOUNTS) {
        try {
            console.log(`Scanning account "${account}"...`);
            const history = await client.database.getAccountHistory(account, -1, 1000);
            console.log(`Fetched ${history.length} ops for account "${account}"`);

            history.forEach(([, operation]) => {
                const op = operation.op;
                if (op[0] === "custom_json") {
                    const { id, json } = op[1];
                    if (
                        id === NFT_CUSTOM_JSON_ID ||
                        id === NFT_SALE_JSON_ID ||
                        id === NFT_VOTE_JSON_ID
                    ) {
                        try {
                            const parsed = JSON.parse(json);
                            // We'll handle them after collecting
                            updatedOps.push({ id, data: parsed });
                        } catch (err) {
                            console.error("Error parsing custom_json:", err);
                        }
                    }
                }
            });
        } catch (error) {
            console.error(`Error fetching account history for ${account}:`, error.message);
        }
    }

    // Merge NFT data or votes into our in-memory store
    mergeOps(updatedOps);
}

/**
 * Merges new NFT ops (safecase_nft, safecase_nft_sale) or vote ops (safecase_vote) into our store.
 */
function mergeOps(ops) {
    ops.forEach(op => {
        const { id, data } = op;
        if (id === NFT_CUSTOM_JSON_ID || id === NFT_SALE_JSON_ID) {
            // This is an NFT creation or sale operation
            mergeNFTData(data);
        } else if (id === NFT_VOTE_JSON_ID) {
            // This is a "like" operation
            applyVoteOp(data);
        }
    });
}

/**
 * Merges a single NFT object into the store (like your old mergeNFTData).
 */
function mergeNFTData(nft) {
    // Use 'permlink' or 'nftId' as a unique key
    let uniqueKey = nft.permlink || nft.nftId;
    if (!uniqueKey) {
        // Fallback in case user didn't set permlink
        uniqueKey = nft._fallbackKey || `fallback-${Date.now()}-${Math.random()}`;
        nft._fallbackKey = uniqueKey;
    }

    const existingIndex = nftStore.findIndex(
        item => (item.permlink || item.nftId || item._fallbackKey) === uniqueKey
    );
    if (existingIndex === -1) {
        // New NFT
        nftStore.push(nft);
    } else {
        // Update existing NFT
        nftStore[existingIndex] = { ...nftStore[existingIndex], ...nft };
    }
}

/**
 * Applies a vote/like operation to increment the NFT's voteCount.
 * The vote op might look like:
 * {
 *   nftId: "safecase-12345",
 *   voter: "username",
 *   timestamp: "2025-03-06T12:34:56Z"
 * }
 */
function applyVoteOp(voteData) {
    const nftId = voteData.nftId;
    if (!nftId) return;

    const index = nftStore.findIndex(
        item => (item.permlink || item.nftId || item._fallbackKey) === nftId
    );
    if (index !== -1) {
        // Increment voteCount on the NFT
        let currentCount = nftStore[index].voteCount || 0;
        nftStore[index].voteCount = currentCount + 1;
        console.log(`Incremented voteCount for NFT "${nftId}" to ${nftStore[index].voteCount}`);
    } else {
        console.warn(`No NFT found for voteData.nftId = ${nftId}`);
    }
}

/**
 * Returns all NFTs in the in-memory store.
 */
function getAllNFTs() {
    return nftStore;
}

module.exports = {
    scanHiveForNFTs,
    getAllNFTs
};
