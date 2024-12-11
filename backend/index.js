import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import { Readable } from 'stream';

dotenv.config();

const app = express();

// Middleware
const corsOptions = {
    origin: "",
    methods: ["POST", "GET", "DELETE", "PUT", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Google Drive setup
const { GOOGLE_SERVICE_ACCOUNT_KEY_JSON, GOOGLE_DRIVE_FOLDER_ID } = process.env;

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(GOOGLE_SERVICE_ACCOUNT_KEY_JSON),
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

// Convert Buffer to Readable Stream
const bufferToStream = (buffer) => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
};

// API Routes
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const fileMetadata = {
      name: req.file.originalname,
      parents: [GOOGLE_DRIVE_FOLDER_ID],
    };

    const media = {
      mimeType: req.file.mimetype,
      body: bufferToStream(req.file.buffer), // Convert Buffer to Readable Stream
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id',
    });

    res.json({ success: true, fileId: response.data.id });
  } catch (error) {
    console.error('Error uploading file:', error.message);
    res.status(500).json({ success: false, message: 'Error uploading file.' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
