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
            "STD;Supertrend@tv-basicstudies"
        ],
        container_id: "tradingview_chart"
    });
}

// GERÇEK ZAMANLI VERİ ALMA
async function fetchMarketData() {
    try {
        const [btc, eth, total2] = await Promise.all([
            fetch(`${MEXC_API}/ticker/24hr?symbol=BTCUSDT.P`),
            fetch(`${MEXC_API}/ticker/24hr?symbol=ETHUSDT.P`),
            fetch(`${MEXC_API}/ticker/24hr?symbol=TOTAL2`)
        ]);
        
        const btcData = await btc.json();
        const ethData = await eth.json();
        const total2Data = await total2.json();
        
        document.getElementById("btc-status").textContent = 
            `BTC: $${parseFloat(btcData.lastPrice).toFixed(2)} (${parseFloat(btcData.priceChangePercent).toFixed(2)}%)`;
        document.getElementById("eth-status").textContent = 
            `ETH: $${parseFloat(ethData.lastPrice).toFixed(2)} (${parseFloat(ethData.priceChangePercent).toFixed(2)}%)`;
        document.getElementById("total2-status").textContent = 
            `TOTAL2: $${(parseFloat(total2Data.lastPrice)/1000000000).toFixed(2)}B (${parseFloat(total2Data.priceChangePercent).toFixed(2)}%)`;
        
        return {
            btc: parseFloat(btcData.lastPrice),
            eth: parseFloat(ethData.lastPrice),
            total2: parseFloat(total2Data.lastPrice)
        };
    } catch (error) {
        console.error("Veri çekme hatası:", error);
        return null;
    }
}

// TEKNİK ANALİZ GÖSTERGELERİ
async function fetchTechnicalIndicators() {
    try {
        const [rsi, macd, supertrend] = await Promise.all([
            fetch(`https://api.taapi.io/rsi?secret=${TAAPI_KEY}&exchange=binance&symbol=${currentSymbol}&interval=${currentTimeframe}m`),
            fetch(`https://api.taapi.io/macd?secret=${TAAPI_KEY}&exchange=binance&symbol=${currentSymbol}&interval=${currentTimeframe}m`),
            fetch(`https://api.taapi.io/supertrend?secret=${TAAPI_KEY}&exchange=binance&symbol=${currentSymbol}&interval=${currentTimeframe}m`)
        ]);
        
        const rsiData = await rsi.json();
        const macdData = await macd.json();
        const supertrendData = await supertrend.json();
        
        document.getElementById("rsi-value").textContent = rsiData.value.toFixed(2);
        document.getElementById("macd-value").textContent = macdData.valueMACDHist.toFixed(4);
        document.getElementById("supertrend-value").textContent = supertrendData.valueRecommend;
        
        return {
            rsi: rsiData.value,
            macd: macdData.valueMACDHist,
            supertrend: supertrendData.valueRecommend
        };
    } catch (error) {
        console.error("Gösterge hatası:", error);
        return null;
    }
}

// SOHBET SİSTEMİ
async function sendMessage() {
    const input = document.getElementById("user-input");
    const message = input.value.trim();
    if(!message) return;

    addMessage(message, "user");
    input.value = "";
    
    try {
        const response = await generateAIResponse(message);
        addMessage(response, "ai");
    } catch (error) {
        addMessage("Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.", "ai");
        console.error("Sohbet hatası:", error);
    }
}

// AI YANIT ÜRETME
async function generateAIResponse(input) {
    const lowerInput = input.toLowerCase();
    
    if(lowerInput.includes("analiz") || lowerInput.includes("rsi") || lowerInput.includes("macd")) {
        const [marketData, techData] = await Promise.all([
            fetchMarketData(),
            fetchTechnicalIndicators()
        ]);
        
        return `
        📊 <strong>${currentSymbol} DETAYLI ANALİZ</strong>
        ━━━━━━━━━━━━━━━━━━━
        🕒 <strong>Zaman:</strong> ${new Date().toLocaleTimeString()}
        💵 <strong>Fiyat:</strong> ${marketData.btc.toFixed(2)}
        
        🔍 <strong>Göstergeler:</strong>
        - RSI: ${techData.rsi.toFixed(2)} ${techData.rsi > 70 ? '🔴' : techData.rsi < 30 ? '🟢' : '🟡'}
        - MACD: ${techData.macd > 0 ? '🟢 Pozitif' : '🔴 Negatif'}
        - Supertrend: ${techData.supertrend === 'buy' ? '🟢 AL' : '🔴 SAT'}
        
        💡 <strong>Öneri:</strong> ${generateRecommendation(techData)}
        `;
    } else {
        return "Kripto analizi için şu formatı kullanın: 'BTCUSDT analiz yapar mısın?' veya 'RSI değeri nedir?'";
    }
}

// ÖNERİ ÜRETME
function generateRecommendation(techData) {
    if(techData.rsi > 70 && techData.macd < 0) {
        return "Aşırı alım + MACD negatif → Kısa pozisyon düşünün";
    } else if(techData.rsi < 30 && techData.macd > 0) {
        return "Aşırı satım + MACD pozitif → Uzun pozisyon için uygun";
    } else {
        return "Piyasa dengede. Küçük pozisyonlarla işlem yapılabilir";
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
        fetchTechnicalIndicators();
    });
});

// ZAMAN DİLİMİ DEĞİŞTİRME
document.getElementById("timeframe").addEventListener("change", function() {
    currentTimeframe = this.value;
    initTradingView();
    fetchTechnicalIndicators();
});

// HIZLI ANALİZ BUTONU
document.getElementById("quick-analysis").addEventListener("click", async () => {
    const analysis = await generateAIResponse(`${currentSymbol} analiz`);
    addMessage(analysis, "ai");
});

// SAYFA YÜKLENİRKEN
window.onload = function() {
    initTradingView();
    fetchMarketData();
    fetchTechnicalIndicators();
    
    // Enter tuşu desteği
    document.getElementById("user-input").addEventListener("keypress", (e) => {
        if(e.key === "Enter") sendMessage();
    });
    
    // Verileri her 30 saniyede bir güncelle
    setInterval(() => {
        fetchMarketData();
        fetchTechnicalIndicators();
    }, 30000);
};
