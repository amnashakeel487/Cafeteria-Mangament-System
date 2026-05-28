const express = require('express');
const supabase = require('../database');

function buildRouter({ recipientType, getRecipientId }) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const recipientId = String(getRecipientId(req));
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_type', recipientType)
        .eq('recipient_id', recipientId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) return res.status(500).json({ message: 'Database error' });
      res.json(data || []);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.patch('/read-all', async (req, res) => {
    try {
      const recipientId = String(getRecipientId(req));
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_type', recipientType)
        .eq('recipient_id', recipientId)
        .eq('is_read', false);

      if (error) return res.status(500).json({ message: 'Database error' });
      res.json({ message: 'All notifications marked as read' });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.patch('/:id/read', async (req, res) => {
    try {
      const recipientId = String(getRecipientId(req));
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', req.params.id)
        .eq('recipient_type', recipientType)
        .eq('recipient_id', recipientId)
        .select()
        .single();

      if (error || !data) return res.status(404).json({ message: 'Notification not found' });
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      const recipientId = String(getRecipientId(req));
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', req.params.id)
        .eq('recipient_type', recipientType)
        .eq('recipient_id', recipientId);

      if (error) return res.status(500).json({ message: 'Database error' });
      res.json({ message: 'Notification deleted' });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  return router;
}

module.exports = { buildRouter };
