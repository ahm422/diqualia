import "server-only";

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

// Lazy-initialized so missing env vars only throw at runtime, not build time.
type StorageClient = { s3: S3Client; bucket: string; publicBase: string };
let _client: StorageClient | null = null;

function getClient(): StorageClient {
  if (!_client) {
    _client = {
      s3: new S3Client({
        endpoint: requireEnv("GARAGE_ENDPOINT"),
        region: "garage",
        credentials: {
          accessKeyId: requireEnv("GARAGE_ACCESS_KEY"),
          secretAccessKey: requireEnv("GARAGE_SECRET_KEY"),
        },
        forcePathStyle: true,
      }),
      bucket: requireEnv("GARAGE_BUCKET"),
      publicBase: requireEnv("GARAGE_PUBLIC_URL").replace(/\/$/, ""),
    };
  }
  return _client;
}

export function publicUrl(key: string): string {
  return `${getClient().publicBase}/${key}`;
}

export async function uploadObject({
  key,
  body,
  contentType,
}: {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
}): Promise<void> {
  const { s3, bucket } = getClient();
  await s3.send(
    new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }),
  );
}

export async function deleteObject({ key }: { key: string }): Promise<void> {
  const { s3, bucket } = getClient();
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
