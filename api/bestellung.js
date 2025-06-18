module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const order = req.body;
      console.log('NEUE BESTELLUNG:', order); // Zeigt Bestellungen in Vercel-Logs
      
      // Erfolgsmeldung senden
      return res.status(200).json({ 
        success: true,
        orderNumber: 'AL-' + Date.now() 
      });
      
    } catch (error) {
      return res.status(500).json({ error: 'Fehler auf dem Server' });
    }
  }
  return res.status(405).send('Nur POST erlaubt');
};