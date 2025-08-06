// script.js
// TradingView Grafik Yükleme
function loadCharts() {
    // Ana Grafik (Büyük Boyut)
    new TradingView.widget({
        "autosize": true,
        "symbol": "MEXC:BTCUSDT.P",
        "interval": "15",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "tr",
        "enable_publishing": false,
        "hide_top_toolbar": false,
        "hide_side_toolbar": false,
        "container_id": "tradingview_main",
        "width": "100%",
        "height": "100%"
    });

    // Diğer Grafikler
    const symbols = [
        { id: 'eth', symbol: 'MEXC:ETHUSDT.P' },
        { id: 'sol', symbol: 'MEXC:SOLUSDT.P' },
        { id: 'sui', symbol: 'MEXC:SUIUSDT.P' }
    ];

    symbols.forEach(item => {
        new TradingView.widget({
            "autosize": true,
            "symbol": item.symbol,
            "interval": "15",
            "timezone": "Etc/UTC",
            "theme": "dark",
            "style": "1",
            "locale": "tr",
            "enable_publishing": false,
            "hide_top_toolbar": true,
            "hide_side_toolbar": true,
            "container_id": `tradingview_${item.id}`,
            "width": "100%",
            "height": "100%"
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

        // 2. RSI için mock veri
        const rsi = await getMockRSI(symbol);

        // 3. Analiz sonucu
        showAnalysis(symbol, currentPrice, rsi);
        
    } catch (error) {
        console.error("API Error:", error);
        showError();
    }
}

// Sayfa yüklendiğinde
window.onload = function() {
    loadCharts();
    document.getElementById("analysis-result").innerHTML = `
        <h3>Hoş Geldiniz!</h3>
        <p>Analiz için yukarıdaki sembollerden birini seçin.</p>
    `;
};
