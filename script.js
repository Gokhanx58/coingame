// API anahtarınızı buraya ekleyin
const API_KEY = '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';  // Buraya OpenAI API anahtarınızı yapıştırın

// ChatGPT ile işlem analizi yapacak fonksiyon
async function getTradeAnalysis(symbol) {
    const url = 'https://api.openai.com/v1/completions';  // OpenAI API endpoint

    const prompt = `Lütfen aşağıdaki sembol için işlem önerisi ve analiz yapın: ${symbol}`;

    const response = await fetch(url, {
        method: 'POST',  // POST isteği gönderiyoruz
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,  // API anahtarını Authorization başlığına ekliyoruz
        },
        body: JSON.stringify({
            model: 'text-davinci-003',  // Kullanılacak model (GPT-3.5)
            prompt: prompt,  // Göndereceğimiz istek
            max_tokens: 200,  // Yanıtın uzunluğu
            temperature: 0.7,  // Yanıtın rastgeleliği (0.0 - 1.0 arasında değişir)
        }),
    });

    const data = await response.json();
    return data.choices[0].text.trim();  // Gelen yanıtı alıyoruz
}

// Bu fonksiyonu, widget’lardan işlem önerisi almak için tetikleyebilirsiniz
document.getElementById("btc-widget").addEventListener('click', () => {
    getTradeAnalysis("BTC/USDT")  // BTC/USDT sembolü için işlem analizi alıyoruz
        .then(analysis => {
            alert("BTC/USDT İşlem Analizi: " + analysis);  // İşlem analizini alert olarak gösteriyoruz
        })
        .catch(error => console.error('API hatası:', error));
});
