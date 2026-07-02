import "server-only";

export function getStorage(bucket: R2Bucket) {
  return {
    async uploadObject({
      key,
      body,
      contentType,
    }: {
      key: string;
      body: Buffer | Uint8Array;
      contentType: string;
    }) {
      await bucket.put(key, body, { httpMetadata: { contentType } });
    },
    async deleteObject({ key }: { key: string }) {
      await bucket.delete(key);
    },
  };
}

export function publicUrl(key: string, publicBase: string) {
  return `${publicBase.replace(/\/$/, "")}/${key}`;
}
