import { broadcastAlert } from '../services/notificationService';
import { getAlerts } from '../services/alertService';

/**
 * Test script to verify SMS alert broadcasting
 * Run with: npx ts-node src/test-sms-broadcast.ts
 */
async function testSmsBroadcasting() {
  console.log('🧪 Testing SMS Alert Broadcasting...\n');

  try {
    // Get the most recent published alert or create a test one
    const alerts = await getAlerts({ status: 'published', limit: 1 });

    if (alerts.length === 0) {
      console.log('❌ No published alerts found. Please publish an alert first through the admin panel.');
      return;
    }

    const testAlert = alerts[0];
    console.log(`📤 Broadcasting alert: "${testAlert.title}"`);
    console.log(`📝 Message preview: ${testAlert.message.substring(0, 100)}...`);
    console.log(`🏷️  Severity: ${testAlert.severity}`);
    console.log(`📍 Region: ${testAlert.region || 'General'}`);
    if (testAlert.advice) {
      console.log(`💡 Advice: ${testAlert.advice.substring(0, 50)}...`);
    }

    console.log('\n📡 Starting broadcast...');

    // This will attempt to send SMS to all users with phone numbers
    await broadcastAlert(testAlert);

    console.log('✅ Broadcast completed successfully!');
    console.log('📱 Check your Twilio dashboard for sent messages.');
    console.log('📋 Check server logs for delivery status.');

  } catch (error) {
    console.error('❌ Broadcast test failed:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testSmsBroadcasting().catch(console.error);
}

export { testSmsBroadcasting };