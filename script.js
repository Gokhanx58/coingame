// script.js - GÜNCELLENMİŞ SİSTEM
const TAAPI_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbHVlIjoiNjg5MzE1YmQ4MDZmZjE2NTFlMDNhZDk1IiwiaWF0IjoxNzU0NDY5ODIxLCJleHAiOjMzMjU4OTMzODIxfQ.UMPhXoWJVe_Vq3vhYUKxoZtZ6KVpFge63d6An8kRcHw";
let currentSymbol = "BTCUSDT.P";

// 1. GERÇEK ZAMANLI VERİ FONKSİYONU (DÜZELTİLMİŞ)
async function getRealTimeData() {
    const now = new Date();
    const timestamp = now.getTime();
    
    // MEXC API'den CANLI veri
    const response = await fetch(`https://api.mexc.com/api/v3/ticker/price?symbol=${currentSymbol}&timestamp=${timestamp}`);
    const data = await response.json();
    
    // Saat kontrolü
    const serverTime = new Date(parseInt(data.time));
    console.log(`Sunucu Saati: ${serverTime.toLocaleTimeString()}, Yerel Saat: ${now.toLocaleTimeString()}`);
    
    return {
        price: parseFloat(data.price),
        time: serverTime
    };
}

// 2. GÜNCEL TEKNİK ANALİZ (TAAPI.IO)
async function getTechnicalAnalysis() {
    const now = new Date();
    const indicators = await Promise.all([
        fetch(`https://api.taapi.io/rsi?secret=${TAAPI_KEY}&exchange=binance&symbol=${currentSymbol}&interval=15m&timestamp=${now.getTime()}`),
        fetch(`https://api.taapi.io/macd?secret=${TAAPI_KEY}&exchange=binance&symbol=${currentSymbol}&interval=15m`),
        fetch(`https://api.taapi.io/supertrend?secret=${TAAPI_KEY}&exchange=binance&symbol=${currentSymbol}&interval=15m`)
    ]);
    
    const [rsi, macd, supertrend] = await Promise.all(indicators.map(res => res.json()));
    
    return {
        rsi: rsi.value,
        macd: macd.valueMACDHist,
        supertrend: supertrend.valueRecommend,
        time: new Date()
    };
}

// 3. KONUŞMA ENTEGRASYONU (DÜZELTİLMİŞ)
async function handleUserInput() {
    const input = document.getElementById('user-input').value;
    if(!input) return;
    
    // Kullanıcı mesajını göster
    addMessage(input, 'user');
    
    // Analiz yap
    if(input.toUpperCase().includes('BTCUSDT') || input.includes('analiz')) {
        const [priceData, techData] = await Promise.all([
            getRealTimeData(),
            getTechnicalAnalysis()
        ]);
        
        const analysis = `
        📊 <strong>REAL-TIME BTC/USDT ANALİZ</strong> 
        ⌚ <em>${techData.time.toLocaleTimeString()}</em>
        ━━━━━━━━━━━━━━━━━━━
        💵 <strong>Fiyat:</strong> ${priceData.price.toFixed(2)}
        📈 <strong>RSI(14):</strong> ${techData.rsi.toFixed(2)} ${techData.rsi > 70 ? '🔴' : techData.rsi < 30 ? '🟢' : '🟡'}
        📉 <strong>MACD:</strong> ${techData.macd > 0 ? '🟢 Pozitif' : '🔴 Negatif'}
        🚦 <strong>Supertrend:</strong> ${techData.supertrend === 'buy' ? '🟢 AL' : '🔴 SAT'}
        
        💡 <strong>Öneri:</strong> ${generateRecommendation(techData)}
        `;
        
        addMessage(analysis, 'ai');
    } else {
        addMessage("Daha detaylı analiz için 'BTCUSDT analiz yap' yazabilirsiniz.", 'ai');
    }
    
    document.getElementById('user-input').value = '';
}

// 4. TRADINGVIEW ENTEGRASYONU (GERÇEK ZAMANLI)
function initTradingView() {
    new TradingView.widget({
        autosize: true,
        symbol: `BINANCE:${currentSymbol}`,
        interval: '15',
        timezone: 'Europe/Istanbul',
        theme: 'dark',
        style: '1',
        locale: 'tr',
        enable_publishing: false,
        allow_symbol_change: true,
        container_id: 'tradingview_chart',
        studies: ["RSI@tv-basicstudies","MACD@tv-basicstudies","Supertrend@tv-basicstudies"]
    });
}

// 5. SAYFA YÜKLENİRKEN
window.onload = function() {
    initTradingView();
    
    // Saat kontrolü
    const clock = document.getElementById('live-clock');
    setInterval(() => {
        clock.textContent = new Date().toLocaleTimeString();
    }, 1000);
    
    // Buton eventi
    document.getElementById('send-btn').addEventListener('click', handleUserInput);
};
