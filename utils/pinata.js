// utils/pinata.js
const axios = require("axios");
const FormData = require("form-data");
const { PINATA_API_KEY, PINATA_SECRET_API_KEY } = require("../config");

/**
 * Uploads a file buffer to Pinata, returning the IPFS CID.
 * @param {Buffer} fileBuffer - The file content
 * @param {String} fileName - The file name
 */
async function pinFileToIPFS(fileBuffer, fileName) {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  let data = new FormData();
  data.append("file", fileBuffer, { filename: fileName });

  const response = await axios.post(url, data, {
    maxBodyLength: Infinity,
    headers: {
      "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_API_KEY
    }
  });
  return response.data; // e.g. { IpfsHash, PinSize, Timestamp }
}

module.exports = {
  pinFileToIPFS
};
