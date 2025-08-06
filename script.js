// script.js - Güncellenmiş AI Analiz Sistemi
async function generateAIResponse(input) {
    input = input.toLowerCase();
    
    // CANLI VERİLERİ AL
    const [btcData, ethData, total2Data, usdtData] = await Promise.all([
        fetchLiveData('BTCUSDT.P'),
        fetchLiveData('ETHUSDT.P'),
        fetchLiveData('TOTAL2'),
        fetchLiveData('USDT.D')
    ]);

    // TEKNİK GÖSTERGELER
    const indicators = {
        btc: await calculateIndicators('BTCUSDT.P'),
        eth: await calculateIndicators('ETHUSDT.P'),
        total2: await calculateIndicators('TOTAL2'),
        usdt: await calculateIndicators('USDT.D')
    };

    // DETAYLI ANALİZ
    if(input.includes('btc') || input.includes('bitcoin')) {
        return `
        📊 <strong>BTC/USDT Detaylı Analiz (${new Date().toLocaleTimeString()})</strong>
        ━━━━━━━━━━━━━━━━━━━
        💵 <strong>Fiyat:</strong> ${btcData.price} 
        📈 <strong>24h Değişim:</strong> ${btcData.change24h}%
        
        🔍 <strong>Teknik Göstergeler:</strong>
        - RSI(14): ${indicators.btc.rsi} ${getRSIState(indicators.btc.rsi)}
        - MACD: ${indicators.btc.macd.histogram > 0 ? '🟢 Pozitif' : '🔴 Negatif'}
        - 200 EMA: ${indicators.btc.ema200} ${btcData.price > indicators.btc.ema200 ? '🟢 Üzerinde' : '🔴 Altında'}
        
        🎯 <strong>Kritik Seviyeler:</strong>
        - Destek: ${indicators.btc.support1} / ${indicators.btc.support2}
        - Direnç: ${indicators.btc.resistance1} / ${indicators.btc.resistance2}
        
        🌐 <strong>Piyasa Durumu:</strong>
        - TOTAL2 (Altcoin Piyasa Değeri): ${total2Data.price} ${total2Data.change24h > 0 ? '🟢' : '🔴'}
        - USDT.D (Dominans): ${usdtData.price}% ${usdtData.change24h > 0 ? '🔴 Risk-Off' : '🟢 Risk-On'}
        
        💡 <strong>Senaryo:</strong> ${generateScenario(indicators)}
        `;
    }
    // ... Diğer coinler için benzer yapılar ...
}

async function fetchLiveData(symbol) {
    const response = await fetch(`https://api.mexc.com/api/v3/ticker/24hr?symbol=${symbol}`);
    const data = await response.json();
    return {
        price: parseFloat(data.lastPrice).toFixed(2),
        change24h: parseFloat(data.priceChangePercent).toFixed(2)
    };
}

async function calculateIndicators(symbol) {
    // Gerçek API entegrasyonu için mock yerine TradingView/TA-Lib kullanılabilir
    return {
        rsi: (Math.random() * 30 + 35).toFixed(2),
        macd: { histogram: (Math.random() * 0.5 - 0.25).toFixed(4) },
        ema200: (Math.random() * 10000 + 30000).toFixed(2),
        support1: (Math.random() * 1000 + 39000).toFixed(2),
        support2: (Math.random() * 1000 + 38000).toFixed(2),
        resistance1: (Math.random() * 1000 + 41000).toFixed(2),
        resistance2: (Math.random() * 1000 + 42000).toFixed(2)
    };
}

function generateScenario(indicators) {
    let scenario = "";
    
    if(indicators.btc.rsi > 70 && indicators.usdt.price < 7) {
        scenario = "Aşırı alım bölgesindeyiz ve USDT dominansı düşüyor. Kısa vadeli düzeltme beklenebilir.";
    } 
    else if(indicators.btc.rsi < 30 && indicators.total2.change24h > 2) {
        scenario = "Altcoinlerde güçlü yükseliş var. BTC'de dip alım fırsatı olabilir.";
    }
    else {
        scenario = "Piyasa dengede. 4 saatlik mum kapanışlarına göre pozisyon alın.";
    }
    
    return scenario + " " + getTradingAdvice(indicators);
}

function getTradingAdvice(indicators) {
    const btc = indicators.btc;
    return `
    \n\n⚡ <strong>Öneri:</strong> ${btc.rsi > 65 ? 'Kısmi kar realizasyonu' : btc.rsi < 35 ? 'Kademeli alım' : 'Pozisyon koruma'}
    `;
}
