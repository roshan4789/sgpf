const path = require('path');
const express = require('express');
const multer = require('multer');
const router = express.Router();

// 1. CONFIGURATION: Save locally to 'uploads/' folder
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); // Save to the 'uploads' folder in backend
  },
  filename(req, file, cb) {
    // Rename file to prevent duplicates: fieldname-timestamp.ext
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// 2. VALIDATION: Allow only Images
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
}

// 3. INITIALIZE MULTER
const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// 4. ROUTE: POST /api/upload
router.post('/', upload.single('image'), (req, res) => {
  if (req.file) {
    // Return the path so the frontend can display it
    // IMPORTANT: Note the backslash/forward slash handling
    res.send(`/${req.file.path.replace(/\\/g, "/")}`);
  } else {
    res.status(400).send('No file uploaded');
  }
});

module.exports = router;