const puppeteer = require('puppeteer');

async function runCronOnce(iteration = 1) {
    const cronUrl = process.env.CRON_URL || 'https://workflows.infinityfree.io/cron.php?token=70d789d381c819689805af21b96b5cce';
    console.log(`\n[${new Date().toLocaleTimeString('tr-TR')}] (#${iteration}) Cron tetikleniyor: ${cronUrl}`);
    
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // Sayfayı aç ve InfinityFree aes.js doğrulamasının tamamlanmasını bekle
        await page.goto(cronUrl, { waitUntil: 'networkidle2', timeout: 45000 });
        
        const bodyText = await page.evaluate(() => document.body.innerText);
        
        console.log('[✓] Sunucu Yanıtı:');
        console.log(bodyText);
    } catch (err) {
        console.error('[X] Hata:', err.message);
    } finally {
        if (browser) await browser.close();
    }
}

(async () => {
    console.log('=== Borsa Tavan Takip Cron Motoru Başlatıldı ===');
    
    // Her 5 dakikalık GitHub tetiklemesinde 5 kez (dakika başı) çalışarak 1 dakikalık hassasiyet sağlar
    for (let i = 1; i <= 15; i++) {
        await runCronOnce(i);
        if (i < 15) {
            console.log('[i] Sonraki kontrol için 60 saniye bekleniyor...');
            await new Promise(resolve => setTimeout(resolve, 60000));
        }
    }
    console.log('=== Tur Tamamlandı ===');
})();
