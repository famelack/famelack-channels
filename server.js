const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

const DATA_DIR = path.join(__dirname, 'channels', 'raw');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/countries', (req, res) => {
  try {
    const metadata = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'countries_metadata.json'), 'utf8'));
    res.json(metadata);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/categories', (req, res) => {
  try {
    const categoriesDir = path.join(DATA_DIR, 'categories');
    const files = fs.readdirSync(categoriesDir).filter(f => f.endsWith('.json'));
    const categories = files.map(f => f.replace('.json', '')).sort();
    res.json(categories);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/channels/country/:code', (req, res) => {
  try {
    const code = req.params.code.toLowerCase();
    const filePath = path.join(DATA_DIR, 'countries', `${code}.json`);
    if (!fs.existsSync(filePath)) {
      return res.json([]);
    }
    const channels = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json(channels);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/channels/category/:name', (req, res) => {
  try {
    const name = req.params.name.toLowerCase();
    const filePath = path.join(DATA_DIR, 'categories', `${name}.json`);
    if (!fs.existsSync(filePath)) {
      return res.json([]);
    }
    const channels = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json(channels);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/stats', (req, res) => {
  try {
    const metadata = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'countries_metadata.json'), 'utf8'));
    const countriesWithChannels = Object.values(metadata).filter(c => c.hasChannels).length;
    const totalCountries = Object.keys(metadata).length;

    const categoriesDir = path.join(DATA_DIR, 'categories');
    const categoryFiles = fs.readdirSync(categoriesDir).filter(f => f.endsWith('.json'));

    let totalChannels = 0;
    const countriesDir = path.join(DATA_DIR, 'countries');
    const countryFiles = fs.readdirSync(countriesDir).filter(f => f.endsWith('.json'));
    for (const file of countryFiles) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(countriesDir, file), 'utf8'));
        totalChannels += data.length;
      } catch (_) {}
    }

    res.json({
      totalChannels,
      totalCountries,
      countriesWithChannels,
      totalCategories: categoryFiles.length
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Famelack channel viewer running on port ${PORT}`);
});
