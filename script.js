// OpenAI API anahtarınızı buraya ekleyin
const API_KEY = 'ZJUHMkqbzgLQWB0FgREO1zAORguqGeEbMU0B7-QwDHuMBqfRVVg1cG_RaExC_K60Y-lXZ9UAKeT3BlbkFJddG2Lm7uCaf_g18Lm82Gt2zEoG37PBTpBw8bF7j7heAtA5VP-RPM1GEuAawDRB4EhxuEq8mE4A';  // Buraya OpenAI API anahtarınızı yapıştırın

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
            document.getElementById("chat-box").innerHTML += `<p><strong>Analiz:</strong> ${analysis}</p>`;  // Analiz kısmını chat-box'a ekle
        })
        .catch(error => {
            document.getElementById("chat-box").innerHTML += `<p><strong>Hata:</strong> Analiz alınamadı.</p>`;
            console.error('API hatası:', error);  // Hata durumunda konsola yaz
        });
}
