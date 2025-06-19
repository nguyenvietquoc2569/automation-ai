#!/usr/bin/env node

/**
 * Run agent services seeding script
 * Usage: npx ts-node scripts/run-seed-services.ts
 */

async function runSeeding() {
  try {
    console.log('🚀 Importing seeding module...');
    
    // Import the seeding function
    const seedingModule = await import('../src/scripts/seed-agent-services');
    const { seedAgentServices } = seedingModule;
    
    console.log('📊 Starting service seeding process...\n');
    
    // Run the seeding
    await seedAgentServices();
    
    console.log('\n✅ Service seeding completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error during service seeding:', error);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Run the seeding
runSeeding();
