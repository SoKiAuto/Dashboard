// src/lib/mongodb.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;
const options = {};

let client;
let clientPromise;

if (!uri) {
  throw new Error("⚠️ Please define the MONGO_URI environment variable in .env.local");
}

if (process.env.NODE_ENV === "development") {
  // In dev, use global to prevent multiple instances on hot reload
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In prod, no global usage
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function connectToDatabase() {
  const client = await clientPromise;
  const db = client.db("wi_controller"); // Explicitly use your DB name
  return { client, db };
}


