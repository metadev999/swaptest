import axios from "axios";

const BITQUERY_API = "https://graphql.bitquery.io/";
const API_KEY = "d0fe1535-48fb-4615-b03d-ed2f88954b66"; // Replace with your real key

export async function fetchNewEthTokens() {
  const query = {
    query: `
    {
      ethereum(network: ethereum) {
        smartContractEvents(
          smartContractMethod: {is: "constructor"}
          smartContractType: {is: "token"}
          date: {since: "2025-07-01"}
          options: {desc: "block.height", limit: 50}
        ) {
          smartContract {
            address {
              address
            }
            currency {
              name
              symbol
            }
          }
          block {
            timestamp {
              time
            }
          }
        }
      }
    }
    `
  };

  const response = await axios.post(BITQUERY_API, query, {
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": API_KEY
    }
  });

  const result = response.data?.data?.ethereum?.smartContractEvents;
  if (!result) {
    console.warn("⚠️ No smartContractEvents returned");
    return [];
  }

  return result.map((e) => ({
    address: e.smartContract.address.address,
    name: e.smartContract.currency.name,
    symbol: e.smartContract.currency.symbol,
    createdAt: e.block.timestamp.time
  }));
}
