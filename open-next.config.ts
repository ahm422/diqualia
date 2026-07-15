import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// buildCommand must be set on the exported OpenNext config — defineCloudflareConfig()
// only accepts CloudflareOverrides and does not forward buildCommand.
export default {
  ...defineCloudflareConfig(),
  buildCommand: "next build",
};
