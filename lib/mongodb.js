import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("❌ Please add your MONGODB_URI to .env.local");
}

const options = {
  tls: true,
  tlsAllowInvalidCertificates: true, // only for dev or self-signed certs
  maxPoolSize: 50,
  retryWrites: true,
  w: "majority",
};

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
