const { supabase } = require('../../config/supabase');

exports.getConfig = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('system_config').select('key, value');
    if (error) throw error;
    
    // Transform array of {key, value} into a single object {key1: val1, key2: val2}
    const configMap = {};
    if (data) {
      data.forEach(item => {
        configMap[item.key] = item.value;
      });
    }

    res.json({ success: true, data: configMap });
  } catch (err) {
    next(err);
  }
};

exports.updateConfig = async (req, res, next) => {
  try {
    const { key, value } = req.body;
    
    if (!key || value === undefined) {
      return res.status(400).json({ success: false, error: { message: 'Key and value are required' }});
    }

    // Fetch old value for audit log
    const { data: oldConfig } = await supabase.from('system_config').select('*').eq('key', key).single();

    const { data, error } = await supabase
      .from('system_config')
      .upsert([{ key, value, updated_by: req.user.id }], { onConflict: 'key' })
      .select()
      .single();

    if (error) throw error;

    req.auditData = { entityId: data.id, oldValue: oldConfig, newValue: data };
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
