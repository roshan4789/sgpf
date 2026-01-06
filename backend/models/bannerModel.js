const mongoose = require('mongoose');
const bannerSchema = mongoose.Schema({
  image: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  desc: { type: String, required: true },
});
module.exports = mongoose.model('Banner', bannerSchema);