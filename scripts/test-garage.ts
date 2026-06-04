import "dotenv/config";
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadBucketCommand } from "@aws-sdk/client-s3";

const endpoint = process.env.GARAGE_ENDPOINT!;
const accessKeyId = process.env.GARAGE_ACCESS_KEY!;
const secretAccessKey = process.env.GARAGE_SECRET_KEY!;
const bucket = process.env.GARAGE_BUCKET!;
const publicBase = (process.env.GARAGE_PUBLIC_URL ?? "").replace(/\/$/, "");

console.log("Endpoint :", endpoint);
console.log("Bucket   :", bucket);
console.log("PublicURL:", publicBase);
console.log("AccessKey:", accessKeyId?.slice(0, 6) + "...");
console.log("");

const s3 = new S3Client({
  endpoint,
  region: "garage",
  credentials: { accessKeyId, secretAccessKey },
  forcePathStyle: true,
});

async function run() {
  // 1. Check bucket exists
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucket }));
    console.log("✅ Bucket reachable");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("❌ Bucket check failed:", msg);
    process.exit(1);
  }

  // 2. Upload test object
  const key = "uploads/test-probe.txt";
  try {
    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: Buffer.from("diqualia-storage-probe"),
      ContentType: "text/plain",
    }));
    console.log("✅ PutObject succeeded ->", key);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("❌ PutObject failed:", msg);
    process.exit(1);
  }

  // 3. Check public URL responds
  const url = `${publicBase}/${key}`;
  console.log("   Public URL:", url);
  try {
    const res = await fetch(url);
    if (res.ok) {
      console.log("✅ Public URL reachable (HTTP", res.status + ")");
    } else {
      console.warn("⚠️  HTTP", res.status, "— bucket may not be public-read");
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn("⚠️  Public URL fetch failed:", msg);
  }

  // 4. Cleanup
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  console.log("✅ Cleanup done — test object deleted");
}

run();
