// api/bestellung.js - Finale Version
module.exports = async (req, res) => {
  // CORS-Einstellungen
  const allowedOrigins = [
    'https://al-safa-parfums.vercel.app',
    'https://www.al-safa-parfums.com'
  ];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Preflight Handling
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Nur POST erlauben
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Methode nicht erlaubt',
      allowed_methods: ['POST']
    });
  }

  try {
    // Request Validation
    if (!req.headers['content-type']?.includes('application/json')) {
      return res.status(400).json({ error: 'Content-Type muss application/json sein' });
    }

    const order = req.body;
    
    // Datenvalidierung
    if (!order || typeof order !== 'object') {
      return res.status(400).json({ error: 'Ungültiges Anfrageformat' });
    }

    const requiredFields = ['customer', 'items'];
    for (const field of requiredFields) {
      if (!order[field]) {
        return res.status(400).json({ 
          error: 'Fehlende Pflichtfelder',
          missing_field: field
        });
      }
    }

    // Telegram-Konfiguration
    const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN?.trim();
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID?.trim();

    if (!TELEGRAM_TOKEN || !CHAT_ID) {
      console.error('Konfigurationsfehler:', {
        TELEGRAM_TOKEN: TELEGRAM_TOKEN ? '***' : 'FEHLT',
        CHAT_ID: CHAT_ID ? '***' : 'FEHLT'
      });
      return res.status(500).json({ 
        error: 'Serverkonfiguration unvollständig',
        required_env_vars: ['TELEGRAM_TOKEN', 'TELEGRAM_CHAT_ID']
      });
    }

    // Nachricht generieren
    const generateOrderMessage = (orderData) => {
      try {
        const products = orderData.items.map(item => 
          `▪️ ${item.name} (${item.menge}x): ${(item.preis * item.menge).toFixed(2)}€`
        ).join('\n');

        const total = orderData.items.reduce((sum, item) => sum + (item.preis * item.menge), 0) + 5.99;
        const orderNumber = orderData.bestellnummer || `AL-${Date.now()}`;

        return `
🛍️ *NEUE BESTELLUNG #${orderNumber}*
⏰ ${new Date().toLocaleString('de-DE')}

👤 *Kunde*
▫️ ${orderData.customer.vorname} ${orderData.customer.nachname}
▫️ 📧 ${orderData.customer.email}
▫️ 📞 ${orderData.customer.telefon || 'nicht angegeben'}

🏠 *Lieferadresse*
▫️ ${orderData.customer.adresse?.strasse || 'nicht angegeben'}
▫️ ${orderData.customer.adresse?.plz || ''} ${orderData.customer.adresse?.stadt || ''}
▫️ ${orderData.customer.adresse?.land || ''}

📦 *Produkte*
${products}

💰 *Gesamtsumme:* ${total.toFixed(2)}€
(inkl. 5.99€ Versand)
        `.trim();
      } catch (e) {
        console.error('Fehler beim Generieren der Nachricht:', e);
        return `⚠️ Neue Bestellung, aber Formatierungsfehler: ${e.message}`;
      }
    };

    // Nachricht senden
    const message = generateOrderMessage(order);
    const telegramEndpoint = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    
    const telegramResponse = await fetch(telegramEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
        disable_notification: false
      }),
      timeout: 5000 // 5 Sekunden Timeout
    });

    const responseData = await telegramResponse.json();

    if (!telegramResponse.ok) {
      console.error('Telegram API Fehler:', {
        status: telegramResponse.status,
        response: responseData
      });
      throw new Error(`Telegram API: ${responseData.description || 'Unbekannter Fehler'}`);
    }

    console.log('Bestellung erfolgreich verarbeitet:', {
      order_number: order.bestellnummer,
      telegram_message_id: responseData.result.message_id
    });

    return res.status(200).json({ 
      success: true,
      order_number: order.bestellnummer || `AL-${Date.now()}`,
      telegram_sent: true
    });

  } catch (error) {
    console.error('Kritischer Fehler:', {
      error: error.message,
      stack: error.stack,
      request_body: req.body
    });

    return res.status(500).json({ 
      error: 'Interner Serverfehler',
      request_id: req.headers['x-vercel-id'],
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// E-Mail senden (mit Fehlerbehandlung)
try {
  await emailjs.send(
    'service_zasjwb2', // Service-ID
    'template_mkj6lxm', // Template-ID
    {
      customer_name: `${formData.vorname} ${formData.nachname}`,
      customer_email: formData.email,
      order_number: bestellnummer,
      order_items: cart.map(item => 
        `${item.name} (${item.menge}x): ${item.preis.toFixed(2)}€`).join('<br>'),
      total: (cart.reduce((sum, item) => sum + (item.preis * item.menge), 0) + 5.99).toFixed(2),
      delivery_address: `
        ${formData.strasse}<br>
        ${formData.plz} ${formData.stadt}<br>
        ${formData.land}
      `
    }
  );
  console.log("E-Mail erfolgreich gesendet!");
} catch (emailError) {
  console.error("E-Mail-Fehler:", emailError);
  alert("Bestellung erhalten, aber E-Mail konnte nicht gesendet werden.");
}