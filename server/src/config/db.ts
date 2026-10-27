import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer: MongoMemoryServer | null = null;

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;

  if (uri && !uri.includes('localhost') && !uri.includes('127.0.0.1')) {
    try {
      console.log('Connecting to external MongoDB cluster...');
      await mongoose.connect(uri);
      console.log('Connected successfully to external MongoDB');
      return mongoose;
    } catch (err) {
      console.warn('External MongoDB connection failed, falling back to local/in-memory MongoDB:', err);
    }
  }

  // Attempt local mongod or start MongoMemoryServer
  try {
    if (uri && (uri.includes('localhost') || uri.includes('127.0.0.1'))) {
      try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
        console.log('Connected to local MongoDB daemon at', uri);
        return mongoose;
      } catch {
        console.log('Local mongod not reachable, starting managed MongoMemoryServer instance...');
      }
    }

    if (!mongoMemoryServer) {
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'academic_booking_portal',
        },
      });
    }

    const memoryUri = mongoMemoryServer.getUri();
    await mongoose.connect(memoryUri);
    console.log(`Connected to MongoDB instance at: ${memoryUri}`);
    return mongoose;
  } catch (error) {
    console.error('Fatal: Could not connect to any MongoDB instance:', error);
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
    mongoMemoryServer = null;
  }
}
