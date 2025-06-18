// api/bestellung.js - Korrigierte Version
module.exports = async (req, res) => {
  // CORS-Header für Sicherheit
  res.setHeader('Access-Control-Allow-Origin', 'https://deine-website.de');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight Request handeln
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      // Daten validieren
      const order = req.body;
      if (!order || !order.customer || !order.items) {
        return res.status(400).json({ error: 'Ungültige Bestelldaten' });
      }

      // Telegram-Benachrichtigung
      const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
      const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

      if (!TELEGRAM_TOKEN || !CHAT_ID) {
        console.error('Telegram Token oder Chat-ID fehlt!');
        return res.status(500).json({ error: 'Serverkonfigurationsfehler' });
      }

      // Formatierte Nachricht erstellen
      const productList = order.items.map(item => 
        `- ${item.name} (${item.menge}x): ${(item.preis * item.menge).toFixed(2)}€`
      ).join('\n');

      const total = order.items.reduce((sum, item) => sum + (item.preis * item.menge), 0) + 5.99;

      const message = `
🛍️ *NEUE BESTELLUNG!*
📋 Nr.: ${order.bestellnummer || 'AL-' + Date.now()}
👤 Kunde: ${order.customer.vorname} ${order.customer.nachname}
📧 E-Mail: ${order.customer.email}
📞 Telefon: ${order.customer.telefon || 'nicht angegeben'}

📦 *Produkte:*
${productList}

💰 *Gesamt:* ${total.toFixed(2)}€ (inkl. 5.99€ Versand)
      `.trim();

      // Nachricht senden
      const telegramResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: 'Markdown'
        })
      });

      if (!telegramResponse.ok) {
        throw new Error('Telegram-API-Fehler');
      }

      // Erfolgsmeldung
      return res.status(200).json({ 
        success: true,
        orderNumber: order.bestellnummer || 'AL-' + Date.now()
      });

    } catch (error) {
      console.error('Fehler:', error);
      return res.status(500).json({ 
        error: 'Serverfehler',
        details: error.message
      });
    }
  }

  return res.status(405).json({ error: 'Methode nicht erlaubt' });
};