const mongoose = require('mongoose');

const auditSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  action: { type: String, required: true },      // e.g., "DELETE_PRODUCT"
  resourceId: { type: String },                  // e.g., Product ID
  details: { type: String },                     // e.g., "Deleted iPhone 13"
  status: { type: String, default: 'SUCCESS' },  // SUCCESS or FAILURE
  ip: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditSchema);