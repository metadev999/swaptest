import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BITQUERY_API_KEY = 'd0fe1535-48fb-4615-b03d-ed2f88954b66';

const query = `
{
  ethereum(network: ethereum) {
    smartContractCalls(
      smartContractMethod: {is: "constructor"}
      smartContractType: {is: "token"}
      options: {desc: "block.timestamp.time", limit: 10}
      date: {since: "${get24hAgoISO()}", till: "${getNowISO()}"}
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
`;

function get24hAgoISO() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('.')[0];
}

function getNowISO() {
  return new Date().toISOString().split('.')[0];
}

const NewEthTokens = () => {
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const res = await axios.post(
          'https://graphql.bitquery.io/',
          { query },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-API-KEY': BITQUERY_API_KEY
            }
          }
        );

        const raw = res.data?.data?.ethereum?.smartContractCalls || [];
        const uniqueTokens = new Map();

        raw.forEach(t => {
          const addr = t.smartContract?.address?.address;
          if (addr && !uniqueTokens.has(addr)) {
            uniqueTokens.set(addr, {
              address: addr,
              name: t.smartContract.currency?.name || 'Unnamed',
              symbol: t.smartContract.currency?.symbol || '???',
              createdAt: t.block.timestamp.time
            });
          }
        });

        setTokens([...uniqueTokens.values()]);
        console.log('📦 New ETH Tokens:', [...uniqueTokens.values()]);
      } catch (err) {
        console.error('❌ Token fetch failed', err);
      }
    };

    fetchTokens();
  }, []);

  if (tokens.length === 0) return <p>Loading new ETH tokens…</p>;

  return (
    <section style={{ padding: '1rem', background: '#0a0a0f', color: '#fff' }}>
      <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '1.8rem', textAlign: 'center' }}>
        🧪 Newly Created Ethereum Tokens
      </h2>
      <div style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
        gap: '1rem', marginTop: '1rem'
      }}>
        {tokens.map((t, i) => (
          <div key={i} style={{
            background: '#1a1a22', padding: '1rem', borderRadius: '8px',
            width: '250px', boxShadow: '0 0 6px rgba(0,255,200,0.2)'
          }}>
            <h3>{t.name} ({t.symbol})</h3>
            <p style={{ fontSize: '0.8rem', color: '#aaa' }}>
              Created: {new Date(t.createdAt).toLocaleString()}
            </p>
            <p style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>
              {t.address}
            </p>
            <div style={{ marginTop: '0.5rem' }}>
              <button
                style={{
                  background: '#00e0b0', border: 'none',
                  padding: '0.4rem 0.8rem', borderRadius: '4px',
                  cursor: 'pointer', marginRight: '0.5rem'
                }}
                onClick={() => analyzeToken(t.address)}
              >
                🔍 Analyze
              </button>
              <a
                href={`https://etherscan.io/token/${t.address}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0ff', fontSize: '0.75rem' }}
              >
                ↗ Etherscan
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

function analyzeToken(address) {
  console.log('Analyzing token:', address);
  // Hook this into your existing logic
}

export default NewEthTokens;
