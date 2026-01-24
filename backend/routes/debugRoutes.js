const express = require('express');
const router = express.Router();
const { listUsers, createWorkerAccount } = require('../controllers/debugController');

router.get('/users', listUsers);
router.post('/setup/worker', createWorkerAccount);

module.exports = router;
