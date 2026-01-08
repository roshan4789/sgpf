// SAFE VERSION: Logs to console only (No Database dependency)
const logAudit = async (req, action, resourceId, details) => {
  try {
    const userName = req.user ? req.user.name : 'Unknown';
    // Just print to the terminal so we know it works
    console.log(`📝 [AUDIT LOG] User: ${userName} | Action: ${action} | ID: ${resourceId}`);
  } catch (error) {
    // If logging fails, DON'T crash the server
    console.error('Audit Log Warning:', error.message);
  }
};

module.exports = logAudit;