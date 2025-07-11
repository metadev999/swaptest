async function loadNewTokens() {
  try {
    const res = await fetch('http://localhost:5001/api/new-tokens');
    const tokens = await res.json();

    const container = document.getElementById('token-list');
    container.innerHTML = '';

    if (tokens.length === 0) {
      container.innerHTML = '<p>⚠️ No new tokens found yet.</p>';
      return;
    }

    tokens.forEach(token => {
      const card = document.createElement('div');
      card.className = 'token-card';
      card.innerHTML = `
        <h3>${token.name} (${token.symbol})</h3>
        <p><strong>Address:</strong> ${token.address}</p>
        <a href="${token.dexUrl}" target="_blank">🔗 View on DexScreener</a>
        <hr/>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error('❌ Failed to load tokens:', err.message);
    document.getElementById('token-list').innerHTML = '<p>Error loading tokens</p>';
  }
}

window.onload = loadNewTokens;
