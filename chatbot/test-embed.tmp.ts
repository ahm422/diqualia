import "dotenv/config";
import { embedQuery } from "../chatbot/rag/embeddings/embeddings";

async function main() {
  try {
    const v = await embedQuery("DiQualia services overview");
    console.log("OK dims=", v.length, "sample=", v.slice(0, 3).map((n) => n.toFixed(4)));
  } catch (e) {
    console.log("EXPECTED-FAIL (placeholder key):", (e as Error).message?.slice(0, 140));
  }
}

main();
