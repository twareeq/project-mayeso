const { supabaseAdmin } = require('../config/supabase');

const auditLogger = (action, entityType) => {
  return async (req, res, next) => {
    // We'll wrap the res.send to log after the request is finished
    const originalSend = res.send;

    res.send = function (data) {
      // Only log successful mutations or as per requirement
      if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method) && res.statusCode < 400) {
        const logData = {
          user_id: req.user ? req.user.id : null,
          action: action || `${req.method.toLowerCase()}.${entityType.toLowerCase()}`,
          entity_type: entityType,
          entity_id: req.params.id || null,
          new_value: req.body,
          ip_address: req.ip,
          user_agent: req.headers['user-agent'],
        };

        // Fire and forget (or handle errors if critical)
        supabaseAdmin.from('audit_logs').insert(logData).then(({ error }) => {
          if (error) console.error('Audit log error:', error);
        });
      }

      return originalSend.apply(res, arguments);
    };

    next();
  };
};

module.exports = { auditLogger };
