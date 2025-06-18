const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // für index.html usw.

// Datenbank
const db = new sqlite3.Database('./bestellungen.db', (err) => {
  if (err) return console.error(err.message);
  console.log('💾 Mit SQLite verbunden.');
});

// Tabelle erstellen
db.run(`CREATE TABLE IF NOT EXISTS bestellungen (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  preis REAL,
  menge INTEGER
)`);

// Route für Bestellungen
app.post('/bestellen', (req, res) => {
  const bestellungen = req.body;

  bestellungen.forEach(item => {
    db.run(
      `INSERT INTO bestellungen (name, preis, menge) VALUES (?, ?, ?)`,
      [item.name, item.preis, item.menge],
      (err) => {
        if (err) return console.error(err.message);
      }
    );
  });

  res.json({ success: true, message: 'Bestellung gespeichert' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
});
