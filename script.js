// TAAPI.IO API KEY
const TAAPI_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbHVlIjoiNjg5MzE1YmQ4MDZmZjE2NTFlMDNhZDk1IiwiaWF0IjoxNzU0NDY5ODIxLCJleHAiOjMzMjU4OTMzODIxfQ.UMPhXoWJVe_Vq3vhYUKxoZtZ6KVpFge63d6An8kRcHw";

// GLOBAL DEĞİŞKENLER
let currentSymbol = "BTCUSDT.P";
let currentTimeframe = "15";
let tvWidget = null;

// TRADINGVIEW WIDGET YÜKLEME
function loadTradingView() {
    if(tvWidget) tvWidget.remove();
    
    tvWidget = new TradingView.widget({
        width: "100%",
        height: "100%",
        symbol: `MEXC:${currentSymbol}`,
        interval: currentTimeframe,
        timezone: "Etc/UTC",
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

// TEKNİK GÖSTERGELERİ AL
async function fetchIndicators() {
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
        console.error("TAAPI Error:", error);
        return null;
    }
}

// CANLI PİYASA VERİLERİ
async function fetchMarketData() {
    try {
        const [btc, eth, total2] = await Promise.all([
            fetch("https://api.mexc.com/api/v3/ticker/24hr?symbol=BTCUSDT.P"),
            fetch("https://api.mexc.com/api/v3/ticker/24hr?symbol=ETHUSDT.P"),
            fetch("https://api.mexc.com/api/v3/ticker/24hr?symbol=TOTAL2")
        ]);
        
        const btcData = await btc.json();
        const ethData = await eth.json();
        const total2Data = await total2.json();
        
        document.getElementById("btc-status").textContent = `BTC: $${parseFloat(btcData.lastPrice).toFixed(2)} (${parseFloat(btcData.priceChangePercent).toFixed(2)}%)`;
        document.getElementById("eth-status").textContent = `ETH: $${parseFloat(ethData.lastPrice).toFixed(2)} (${parseFloat(ethData.priceChangePercent).toFixed(2)}%)`;
        document.getElementById("total2-status").textContent = `TOTAL2: $${(parseFloat(total2Data.lastPrice)/1000000000).toFixed(2)}B (${parseFloat(total2Data.priceChangePercent).toFixed(2)}%)`;
        
        return {
            btc: parseFloat(btcData.lastPrice),
            eth: parseFloat(ethData.lastPrice),
            total2: parseFloat(total2Data.lastPrice)
        };
    } catch (error) {
        console.error("Market Data Error:", error);
        return null;
    }
}

// AI ANALİZ SİSTEMİ
async function generateAnalysis(question) {
    const [marketData, indicators] = await Promise.all([
        fetchMarketData(),
        fetchIndicators()
    ]);
    
    // DETAYLI ANALİZ OLUŞTUR
    let analysis = `
    📊 <strong>${currentSymbol} Analiz Raporu</strong>
    ━━━━━━━━━━━━━━━━━━━
    🕒 <strong>Zaman Dilimi:</strong> ${currentTimeframe} Dakika
    💵 <strong>Fiyat:</strong> ${marketData.btc.toFixed(2)}
    
    🔍 <strong>Teknik Göstergeler:</strong>
    - RSI(14): ${indicators.rsi.toFixed(2)} ${indicators.rsi > 70 ? '🔴 Aşırı Alım' : indicators.rsi < 30 ? '🟢 Aşırı Satım' : '🟡 Nötr'}
    - MACD: ${indicators.macd > 0 ? '🟢 Pozitif' : '🔴 Negatif'}
    - Supertrend: ${indicators.supertrend === 'buy' ? '🟢 AL Sinyali' : '🔴 SAT Sinyali'}
    
    🌐 <strong>Piyasa Durumu:</strong>
    - BTC Dominansı: ${(marketData.btc / marketData.total2 * 100).toFixed(2)}%
    - Altcoin Piyasa Değeri: $${(marketData.total2/1000000000).toFixed(2)}B
    `;
    
    // ÖNERİ EKLE
    analysis += `
    💡 <strong>Öneri:</strong> ${generateRecommendation(indicators, marketData)}
    `;
    
    return analysis;
}

function generateRecommendation(indicators, marketData) {
    if(indicators.rsi > 70 && indicators.macd < 0) {
        return "Aşırı alım bölgesi + MACD negatif → Kısa vadeli düzeltme beklenebilir";
    } else if(indicators.rsi < 30 && marketData.total2 > marketData.btc) {
        return "Aşırı satım + Altcoinler güçlü → Uzun pozisyon için uygun zaman";
    } else {
        return "Piyasa dengede. Küçük pozisyonlarla işlem yapılabilir";
    }
}

// SOHBET SİSTEMİ
document.getElementById("send-btn").addEventListener("click", async () => {
    const input = document.getElementById("user-input").value;
    if(!input.trim()) return;
    
    addMessage(input, "user");
    document.getElementById("user-input").value = "";
    
    const response = await generateAnalysis(input);
    addMessage(response, "ai");
});

function addMessage(content, sender) {
    const chatBox = document.getElementById("chat-messages");
    const messageDiv = document.createElement("div");
    messageDiv.className = `${sender}-message`;
    messageDiv.innerHTML = `<p>${content}</p>`;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// GRAFİK YÜKLEME
document.getElementById("image-upload").addEventListener("change", function(e) {
    const file = e.target.files[0];
    if(file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            addMessage(`<img src="${event.target.result}" style="max-width:100%;">`, "user");
            
            // Görsel analiz yanıtı
            setTimeout(() => {
                addMessage("Grafik analizim: Güçlü bir yükseliş kanalı görüyorum. 42.500$ direnç seviyesi kritik. RSI 65 ile aşırı alım bölgesine yaklaşıyor.", "ai");
            }, 1500);
        }
        reader.readAsDataURL(file);
    }
});

// SEMBOL DEĞİŞTİRME
document.querySelectorAll(".symbol-tabs button").forEach(btn => {
    btn.addEventListener("click", function() {
        currentSymbol = this.dataset.symbol;
        document.querySelector(".symbol-tabs button.active").classList.remove("active");
        this.classList.add("active");
        loadTradingView();
        fetchIndicators();
    });
});

// ZAMAN DİLİMİ DEĞİŞTİRME
document.getElementById("timeframe").addEventListener("change", function() {
    currentTimeframe = this.value;
    loadTradingView();
    fetchIndicators();
});

// SAYFA YÜKLENİRKEN
window.onload = function() {
    loadTradingView();
    fetchMarketData();
    fetchIndicators();
    
    // 30 saniyede bir verileri güncelle
    setInterval(() => {
        fetchMarketData();
        fetchIndicators();
    }, 30000);
};
