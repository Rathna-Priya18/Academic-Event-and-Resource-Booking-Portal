import dotenv from 'dotenv';
import { connectDB, disconnectDB } from './src/config/db';
import { seedDatabase } from './src/seed/seedData';

dotenv.config();

async function runSeed() {
  console.log('Connecting to database for explicit manual re-seed...');
  await connectDB();
  await seedDatabase(true);
  console.log('Database successfully re-seeded with demo records.');
  await disconnectDB();
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('Seed command failed:', err);
  process.exit(1);
});
