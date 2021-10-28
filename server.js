require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Database = require("@replit/database");
const bodyParser = require('body-parser');

const app = express();
const db = new Database();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', async function (req, res) {
  if (!isValidHttpUrl(req.body.url)) {
    return res.json({
      error:"Invalid URL"
    });
  }

  var keys = await db.list();

  // Handling duplicates
  for (var i = 0; i < keys.length; i++) {
    const value = await db.get(keys[i]);
    if (value == req.body.url) {
      return res.json({
        original_url:value,
        short_url:keys[i]
      })
    }
  }

  await db.set(keys.length + 1, req.body.url);

  return res.json({
    original_url:req.body.url,
    short_url:keys.length + 1
  })
});

app.get('/api/shorturl/:short_url', async function (req, res) {
  if (isNaN(req.params.short_url)) {
    return res.json({
      error:"Wrong format"
    });
  }

  var url = await db.get(req.params.short_url);

  if (url == null) {
    return res.json({
      error:"No short URL found for the given input"
    });
  }

  res.redirect(url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

function isValidHttpUrl(string) {
  let url;
  
  try {
    url = new URL(string);
  } catch (_) {
    return false;  
  }

  return url.protocol === "http:" || url.protocol === "https:";
}
