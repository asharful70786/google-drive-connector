const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { google } = require('googleapis');


const app = express();
app.use(cors(
  {
    origin: "http://localhost:5173"
  }
));
app.use(express.json());

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);


// 1️⃣ Get Google Auth URL
app.get('/auth/url', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive.readonly'],
    prompt: 'consent',
  });
  res.send({ url });
});

// 2️⃣ Handle Google OAuth Callback
app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${encodeURIComponent(JSON.stringify(tokens))}`);
});

// 3️⃣ Get Media Files (Frontend sends token)
app.post('/files', async (req, res) => {
  const { token } = req.body;
 oauth2Client.setCredentials(token);
  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  const result = await drive.files.list({
    q: "mimeType contains 'image/' or mimeType contains 'video/'",
    fields: 'files(id, name, mimeType, thumbnailLink, webViewLink)',
    pageSize: 100,
  });

  res.json(result.data.files);
});

app.listen(5000, () => console.log( 'server running on 5000'));
