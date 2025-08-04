// OpenAI API anahtarınızı buraya ekleyin
const API_KEY = 'VOWwtHTASlQLGmyryLC6TylNuxHDseRyqkhFymJmU6lblTY2geB1xUTDgOR3jiFhzPe1BSzPdNT3BlbkFJRccwsCgw4uXoM939FIJtV95S-IoZNIc3WykSv2t8d56OnbHQF_qvEPhUsEAWHKmcUvdZCf0NoA';  // Buraya OpenAI API anahtarınızı yapıştırın

// TradingView grafiği için sembol
const symbol = "BTC/USDT";  // Örnek olarak BTC/USDT kullanıldı

// TradingView widget'ı için sembol dinamik olarak değişebilir

async function getTradeAnalysis(symbol) {
    const url = 'https://api.openai.com/v1/completions';  // OpenAI API endpoint

    const prompt = `Lütfen aşağıdaki sembol için işlem önerisi ve analiz yapın: ${symbol}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model: 'text-davinci-003',
                prompt: prompt,
                max_tokens: 200,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            throw new Error(`API isteği başarısız: ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].text.trim();  // Gelen yanıtı alıyoruz
    } catch (error) {
        console.error('API hatası:', error);
        throw new Error('API hatası: Analiz alınamadı');
    }
}

// Kullanıcının seçtiği sembole göre işlem analizi alacağız
function getAnalysis() {
    const symbol = document.getElementById("symbol-select").value;  // Seçilen sembol
    if (!symbol) {
        alert("Lütfen bir sembol seçin!");  // Seçim yapılmazsa uyarı ver
        return;
    }

    // API'den işlem analizi alıyoruz ve chat-box'a ekliyoruz
    getTradeAnalysis(symbol)
        .then(analysis => {
            document.getElementById("chat-box").innerHTML += `<p><strong>Analiz:</strong> ${analysis}</p>`;

            // Grafik görselini eklemek
            const imgUrl = `https://www.tradingview.com/chart/${symbol}/`;
            document.getElementById("chat-box").innerHTML += `<img src="${imgUrl}" alt="${symbol} grafiği" width="600" height="400">`;
        })
        .catch(error => {
            document.getElementById("chat-box").innerHTML += `<p><strong>Hata:</strong> ${error.message}</p>`;
            console.error('API hatası:', error);  // Hata detayını konsola yazıyoruz
        });
}
