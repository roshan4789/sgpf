const path = require('path');
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Created uploads directory at:', uploadsDir);
  }
} catch (error) {
  console.error('❌ Error creating uploads directory:', error.message);
  throw new Error('Failed to create uploads directory: ' + error.message);
}

// 1. CONFIGURATION: Save locally to 'uploads/' folder
const storage = multer.diskStorage({
  destination(req, file, cb) {
    // Ensure directory exists before saving
    if (!fs.existsSync(uploadsDir)) {
      try {
        fs.mkdirSync(uploadsDir, { recursive: true });
      } catch (err) {
        return cb(new Error('Failed to create uploads directory: ' + err.message));
      }
    }
    cb(null, uploadsDir);
  },
  filename(req, file, cb) {
    // Rename file to prevent duplicates: fieldname-timestamp-random.ext
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(sanitizedName)}`);
  },
});

// 2. VALIDATION: Allow only Images with size limit
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)!'));
  }
}

// 3. INITIALIZE MULTER with file size limit (5MB)
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// 4. ROUTE: POST /api/upload
router.post('/', (req, res) => {
  console.log('📤 Upload request received');
  console.log('   Uploads directory:', uploadsDir);
  console.log('   Directory exists:', fs.existsSync(uploadsDir));
  console.log('   Request headers:', {
    'content-type': req.headers['content-type'],
    'authorization': req.headers['authorization'] ? 'Present' : 'Missing',
    'content-length': req.headers['content-length']
  });

  upload.single('image')(req, res, (err) => {
    console.log('📤 Multer processing complete');
    console.log('   Error:', err ? err.message : 'None');
    console.log('   File received:', req.file ? 'Yes' : 'No');
    if (req.file) {
      console.log('   File details:', {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        filename: req.file.filename
      });
    }
    if (err) {
      // Handle multer errors
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            message: 'File too large. Maximum size is 5MB.',
            error: err.message
          });
        }
        return res.status(400).json({
          message: 'Upload error: ' + err.message,
          error: err.message
        });
      }
      // Handle validation errors
      return res.status(400).json({
        message: err.message || 'File upload failed',
        error: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: 'No file uploaded. Please select an image file.',
        error: 'No file provided'
      });
    }

    try {
      // Verify file was actually saved
      if (!req.file || !req.file.path) {
        return res.status(500).json({
          message: 'File was not saved properly',
          error: 'File path is missing'
        });
      }

      // Verify file exists on disk
      if (!fs.existsSync(req.file.path)) {
        console.error('❌ File not found after upload:', req.file.path);
        return res.status(500).json({
          message: 'Uploaded file not found on server',
          error: 'File does not exist at: ' + req.file.path
        });
      }

      // Return the path so the frontend can display it
      // IMPORTANT: Note the backslash/forward slash handling
      const filePath = `/uploads/${req.file.filename}`;
      console.log('✅ File uploaded successfully:', {
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        url: filePath
      });

      res.json({
        path: filePath,
        filename: req.file.filename,
        size: req.file.size,
        message: 'Image uploaded successfully'
      });
    } catch (error) {
      // Clean up file if there's an error
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      }
      console.error('Upload error:', error);
      res.status(500).json({
        message: 'Error processing uploaded file',
        error: error.message
      });
    }
  });
});

module.exports = router;
