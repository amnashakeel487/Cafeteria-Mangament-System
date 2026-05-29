const supabase = require('../database');

async function runMidnightAvailabilityReset() {
  console.log('Running midnight availability reset...');

  const { data: soldOutItems, error: fetchError } = await supabase
    .from('menu_items')
    .select('id, cafeteria_id, name')
    .eq('is_available', false)
    .eq('auto_reset_enabled', true);

  if (fetchError) throw fetchError;
  if (!soldOutItems?.length) {
    console.log('No items to reset');
    return { count: 0 };
  }

  const { error: updateError } = await supabase
    .from('menu_items')
    .update({
      is_available: true,
      sold_out_at: null,
      sold_out_reason: null,
    })
    .eq('is_available', false)
    .eq('auto_reset_enabled', true);

  if (updateError) throw updateError;

  const logs = soldOutItems.map((item) => ({
    menu_item_id: item.id,
    cafeteria_id: item.cafeteria_id,
    changed_by: 'system',
    previous_status: false,
    new_status: true,
    reason: 'Automatic midnight reset',
    reset_type: 'auto_midnight',
  }));

  const { error: logError } = await supabase.from('availability_logs').insert(logs);
  if (logError) console.warn('Midnight reset log insert:', logError.message);

  console.log(`Midnight reset complete: ${soldOutItems.length} items restored`);
  return { count: soldOutItems.length };
}

function scheduleMidnightReset() {
  let cron;
  try {
    cron = require('node-cron');
  } catch (err) {
    console.warn('node-cron not installed — midnight reset disabled:', err.message);
    return;
  }

  cron.schedule(
    '0 0 * * *',
    async () => {
      try {
        await runMidnightAvailabilityReset();
      } catch (error) {
        console.error('Midnight reset failed:', error?.message || error);
      }
    },
    { timezone: 'Asia/Karachi' }
  );

  console.log('Midnight availability reset scheduled (Asia/Karachi)');
}

module.exports = { scheduleMidnightReset, runMidnightAvailabilityReset };
