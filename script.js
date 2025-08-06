// API KONFİGÜRASYONU
const TAAPI_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbHVlIjoiNjg5MzE1YmQ4MDZmZjE2NTFlMDNhZDk1IiwiaWF0IjoxNzU0NDY5ODIxLCJleHAiOjMzMjU4OTMzODIxfQ.UMPhXoWJVe_Vq3vhYUKxoZtZ6KVpFge63d6An8kRcHw"; // Kendi TAAPI keyiniz
const MEXC_API = "https://api.mexc.com/api/v3";
let currentSymbol = "BTCUSDT.P";
let currentTimeframe = "15";
let tvWidget = null;

// TRADINGVIEW BAŞLATMA
function initTradingView() {
    if(tvWidget) tvWidget.remove();
    
    tvWidget = new TradingView.widget({
        width: "100%",
        height: "100%",
        symbol: `MEXC:${currentSymbol}`,
        interval: currentTimeframe,
        timezone: "Europe/Istanbul",
        theme: "dark",
        style: "1",
        locale: "tr",
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_side_toolbar: false,
        studies: [
            "RSI@tv-basicstudies",
            "MACD@tv-basicstudies",
            "STD;Supertrend@tv-basicstudies",
            "Volume@tv-basicstudies"
        ],
        container_id: "tradingview_chart"
    });
}

// SEMBOL ÇIKARMA
function extractSymbol(text) {
    const symbolMap = {
        "btc": "BTCUSDT.P",
        "eth": "ETHUSDT.P",
        "sol": "SOLUSDT.P",
        "sui": "SUIUSDT.P",
        "doge": "DOGEUSDT.P",
        "avax": "AVAXUSDT.P",
        "dominance": "BTC.D",
        "total2": "TOTAL2",
        "usdt.d": "USDT.D"
    };
    
    const lowerText = text.toLowerCase();
    for(const [key, symbol] of Object.entries(symbolMap)) {
        if(lowerText.includes(key)) return symbol;
    }
    return null;
}

// GERÇEK ZAMANLI VERİ
async function fetchMarketData(symbol) {
    try {
        const response = await fetch(`${MEXC_API}/ticker/24hr?symbol=${symbol}`);
        const data = await response.json();
        return {
            price: parseFloat(data.lastPrice),
            change: parseFloat(data.priceChangePercent),
            high: parseFloat(data.highPrice),
            low: parseFloat(data.lowPrice),
            volume: parseFloat(data.volume)
        };
    } catch (error) {
        console.error("Veri çekme hatası:", error);
        return null;
    }
}

// TEKNİK GÖSTERGELER
async function fetchTechnicalIndicators(symbol) {
    try {
        const [rsi, macd, supertrend] = await Promise.all([
            fetch(`https://api.taapi.io/rsi?secret=${TAAPI_KEY}&exchange=binance&symbol=${symbol}&interval=${currentTimeframe}m`),
            fetch(`https://api.taapi.io/macd?secret=${TAAPI_KEY}&exchange=binance&symbol=${symbol}&interval=${currentTimeframe}m`),
            fetch(`https://api.taapi.io/supertrend?secret=${TAAPI_KEY}&exchange=binance&symbol=${symbol}&interval=${currentTimeframe}m`)
        ]);
        
        return {
            rsi: (await rsi.json()).value,
            macd: (await macd.json()).valueMACDHist,
            supertrend: (await supertrend.json()).valueRecommend
        };
    } catch (error) {
        console.error("Gösterge hatası:", error);
        return null;
    }
}

// DETAYLI ANALİZ
async function generateAnalysis(symbol) {
    const [marketData, techData, btcDom, total2] = await Promise.all([
        fetchMarketData(symbol),
        fetchTechnicalIndicators(symbol),
        fetchMarketData("BTC.D"),
        fetchMarketData("TOTAL2")
    ]);

    // TREND ANALİZİ
    const trend = marketData.change > 0 ? "🟢 Yükseliş" : marketData.change < 0 ? "🔴 Düşüş" : "🟡 Yatay";
    
    // RSI DURUMU
    const rsiStatus = techData.rsi > 70 ? "🔴 Aşırı Alım" : 
                     techData.rsi < 30 ? "🟢 Aşırı Satım" : "🟡 Nötr";
    
    // SENARYOLAR
    const scenarios = [];
    if(techData.rsi < 35 && techData.macd > 0) {
        scenarios.push({
            text: "RSI dip + MACD pozitif → Güçlü yükseliş potansiyeli",
            probability: 75
        });
    }
    if(techData.rsi > 65 && marketData.change > 8) {
        scenarios.push({
            text: "Aşırı alım + hızlı yükseliş → Kısa vadeli düzeltme",
            probability: 80
        });
    }
    if(scenarios.length === 0) {
        scenarios.push({
            text: "Belirsiz piyasa koşulları",
            probability: 50
        });
    }

    return `
    📊 <strong>${symbol} DETAYLI ANALİZ</strong> (${new Date().toLocaleTimeString('tr-TR')})
    ━━━━━━━━━━━━━━━━━━━
    💹 <strong>Trend:</strong> ${trend} (${marketData.change.toFixed(2)}%)
    💵 <strong>Fiyat:</strong> ${marketData.price.toFixed(2)}
    📈 <strong>Yüksek/Alçak:</strong> ${marketData.high.toFixed(2)} / ${marketData.low.toFixed(2)}
    💰 <strong>Hacim (24s):</strong> ${(marketData.volume/1000).toFixed(1)}K
    
    🔍 <strong>Teknik Göstergeler:</strong>
    - RSI(14): ${techData.rsi.toFixed(2)} ${rsiStatus}
    - MACD: ${techData.macd > 0 ? '🟢 Pozitif' : '🔴 Negatif'} (${techData.macd.toFixed(4)})
    - Supertrend: ${techData.supertrend === 'buy' ? '🟢 AL' : '🔴 SAT'}
    
    🌐 <strong>Piyasa Durumu:</strong>
    - BTC Dominansı: ${btcDom.price.toFixed(2)}%
    - Altcoin Piyasa Değeri: $${(total2.price/1000000000).toFixed(2)}B
    
    💡 <strong>Olası Senaryolar (${new Date().toLocaleDateString('tr-TR')}):</strong>
    ${scenarios.map((s,i) => `${i+1}. ${s.text} (${s.probability}% olasılık)`).join('\n')}
    
    ⚠️ <strong>Risk Yönetimi:</strong>
    - Stop Loss: ${(marketData.price * 0.98).toFixed(2)}
    - Take Profit: ${(marketData.price * 1.05).toFixed(2)}
    `;
}

// SOHBET SİSTEMİ
async function handleUserMessage() {
    const input = document.getElementById("user-input");
    const message = input.value.trim();
    if(!message) return;

    addMessage(message, "user");
    input.value = "";

    try {
        // OTOMATİK SEMBOL ALGILAMA
        const symbol = extractSymbol(message) || currentSymbol;
        const analysis = await generateAnalysis(symbol);
        addMessage(analysis, "ai");
    } catch (error) {
        addMessage("Analiz sırasında hata oluştu. Lütfen tekrar deneyin.", "ai");
        console.error("Mesaj işleme hatası:", error);
    }
}

// MESAJ EKLEME
function addMessage(content, sender) {
    const chatBox = document.getElementById("chat-messages");
    const msgDiv = document.createElement("div");
    msgDiv.className = `${sender}-message`;
    msgDiv.innerHTML = `<p>${content}</p>`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// SEMBOL DEĞİŞTİRME
document.querySelectorAll(".symbol-tabs button").forEach(btn => {
    btn.addEventListener("click", function() {
        currentSymbol = this.dataset.symbol;
        document.querySelector(".symbol-tabs button.active").classList.remove("active");
        this.classList.add("active");
        initTradingView();
        updateIndicators();
    });
});

// GÖSTERGELERİ GÜNCELLE
async function updateIndicators() {
    const techData = await fetchTechnicalIndicators(currentSymbol);
    document.getElementById("rsi-value").textContent = techData.rsi.toFixed(2);
    document.getElementById("macd-value").textContent = techData.macd.toFixed(4);
    document.getElementById("supertrend-value").textContent = techData.supertrend === 'buy' ? 'AL' : 'SAT';
}

// SAYFA YÜKLENİRKEN
window.onload = function() {
    initTradingView();
    updateIndicators();
    
    // EVENT LISTENERS
    document.getElementById("user-input").addEventListener("keypress", (e) => {
        if(e.key === "Enter") handleUserMessage();
    });
    document.getElementById("send-btn").addEventListener("click", handleUserMessage);
    document.getElementById("quick-analysis").addEventListener("click", async () => {
        const analysis = await generateAnalysis(currentSymbol);
        addMessage(analysis, "ai");
    });

    // 30 SANİYEDE BİR GÜNCELLE
    setInterval(updateIndicators, 30000);
};
