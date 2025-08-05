// TradingView Grafik Yükleme
function loadCharts() {
    const symbols = [
        { id: 'btc', symbol: 'MEXC:BTCUSDT.P' },
        { id: 'eth', symbol: 'MEXC:ETHUSDT.P' },
        { id: 'sol', symbol: 'MEXC:SOLUSDT.P' },
        { id: 'sui', symbol: 'MEXC:SUIUSDT.P' },
        { id: 'avax', symbol: 'MEXC:AVAXUSDT.P' },
        { id: 'doge', symbol: 'MEXC:DOGEUSDT.P' }
    ];

    symbols.forEach(item => {
        new TradingView.widget({
            "autosize": true,
            "symbol": item.symbol,
            "interval": "5",
            "timezone": "Etc/UTC",
            "theme": "dark",
            "style": "1",
            "locale": "tr",
            "enable_publishing": false,
            "hide_top_toolbar": false,
            "hide_side_toolbar": false,
            "container_id": `tradingview_${item.id}`
        });
    });
}

// MEXC API ile analiz
async function analyzeSymbol(symbol) {
    try {
        // 1. Fiyat verisi
        const priceRes = await fetch(`https://api.mexc.com/api/v3/ticker/price?symbol=${symbol}`);
        const priceData = await priceRes.json();
        const currentPrice = parseFloat(priceData.price);

        // 2. RSI için mock veri (Ücretsiz API sınırı nedeniyle)
        const rsi = await getMockRSI(symbol);

        // 3. Analiz sonucu
        showAnalysis(symbol, currentPrice, rsi);
        
    } catch (error) {
        console.error("API Error:", error);
        showError();
    }
}

// Mock RSI Üretici (Gerçekte API'den alınacak)
async function getMockRSI(symbol) {
    const symbols = {
        'BTCUSDT.P': 62.4,
        'ETHUSDT.P': 58.1,
        'SOLUSDT.P': 71.3,
        'SUIUSDT.P': 42.7,
        'AVAXUSDT.P': 39.2,
        'DOGEUSDT.P': 67.8
    };
    return symbols[symbol] || 50 + (Math.random() * 20 - 10);
}

function showAnalysis(symbol, price, rsi) {
    const { recommendation, probability } = generateRecommendation(rsi);
    const support = (price * 0.985).toFixed(4);
    const resistance = (price * 1.015).toFixed(4);

    document.getElementById("analysis-result").innerHTML = `
        <h3>${symbol} Analiz (5 Dakika)</h3>
        <div class="metric">
            <span class="label">📈 Fiyat:</span>
            <span class="value">${price.toFixed(4)}</span>
        </div>
        <div class="metric">
            <span class="label">📊 RSI:</span>
            <span class="value ${rsi > 70 ? 'danger' : rsi < 30 ? 'success' : 'warning'}">
                ${rsi.toFixed(2)} ${rsi > 70 ? '🔴' : rsi < 30 ? '🟢' : '🟡'}
            </span>
        </div>
        <div class="metric">
            <span class="label">🎯 Öneri:</span>
            <span class="value ${recommendation === 'SAT' ? 'danger' : recommendation === 'AL' ? 'success' : 'warning'}">
                ${recommendation} <small>(${probability})</small>
            </span>
        </div>
        <div class="metric">
            <span class="label">🛡️ Destek:</span>
            <span class="value">${support}</span>
        </div>
        <div class="metric">
            <span class="label">✈️ Direnç:</span>
            <span class="value">${resistance}</span>
        </div>
        <div class="timestamp">
            ⏳ ${new Date().toLocaleString('tr-TR')}
        </div>
    `;
}

function generateRecommendation(rsi) {
    if(rsi > 70) return { recommendation: "SAT", probability: "%75 düşüş" };
    if(rsi < 30) return { recommendation: "AL", probability: "%70 yükseliş" };
    return { recommendation: "BEKLE", probability: "%60 yatay" };
}

function showError() {
    document.getElementById("analysis-result").innerHTML = `
        <h3 class="error">⚠️ API Limit Aşıldı</h3>
        <p>Lütfen 1 dakika sonra tekrar deneyin.</p>
        <p>Daha fazla istek için <a href="https://www.mexc.com/developers" target="_blank">MEXC API</a> anahtarı alabilirsiniz.</p>
    `;
}

// Sayfa yüklendiğinde
window.onload = function() {
    loadCharts();
    document.getElementById("analysis-result").innerHTML = `
        <h3>Hoş Geldiniz!</h3>
        <p>Analiz için yukarıdaki sembollerden birini seçin.</p>
    `;
};
