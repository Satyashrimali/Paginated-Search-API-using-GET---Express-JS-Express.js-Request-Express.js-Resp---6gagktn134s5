const express = require('express');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Already loaded the database (It's now a direct array)
const allArticles = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));

const DEFAULT_LIMIT = 5;
const DEFAULT_PAGE = 1;

// Turns a query value into a positive integer, falling back to a default
const toPositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

app.get('/search', (req, res) => {
  const name = typeof req.query.name === 'string' ? req.query.name.trim() : '';

  if (!name) {
    return res.status(400).json({ error: 'Search name parameter is required.' });
  }

  const limit = toPositiveInt(req.query.limit, DEFAULT_LIMIT);
  const page = toPositiveInt(req.query.page, DEFAULT_PAGE);

  // Case-insensitive match on the article title
  const searchTerm = name.toLowerCase();
  const matches = allArticles.filter((article) =>
    String(article.title).toLowerCase().includes(searchTerm)
  );

  const totalResults = matches.length;
  const totalPages = Math.ceil(totalResults / limit);
  const start = (page - 1) * limit;

  return res.status(200).json({
    currentPage: page,
    totalPages,
    totalResults,
    articles: matches.slice(start, start + limit),
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = { app };
