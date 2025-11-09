import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing MONGODB_URI environment variable.");
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const options: Parameters<typeof MongoClient>[1] = {};

const client = new MongoClient(uri, options);

const clientPromise =
  global._mongoClientPromise ?? client.connect();

if (!global._mongoClientPromise) {
  global._mongoClientPromise = clientPromise;
}

export default clientPromise;
