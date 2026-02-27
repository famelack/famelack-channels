const fs = require('fs');
const path = require('path');

exports.handler = async () => {
  try {
    const categoriesDir = path.resolve('channels/raw/categories');
    const files = fs.readdirSync(categoriesDir).filter(f => f.endsWith('.json'));
    const categories = files.map(f => f.replace('.json', '')).sort();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categories),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message }),
    };
  }
};
