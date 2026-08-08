#!/usr/bin/env bash
# workerd/miniflare binds to [::1] for the remote proxy / inspector.
# Some LXC/Proxmox hosts disable IPv6 on loopback, which breaks `next dev`.
set -euo pipefail

if [[ "$(uname -s)" != "Linux" ]]; then
  exit 0
fi

if [[ -r /proc/sys/net/ipv6/conf/lo/disable_ipv6 ]] && [[ "$(cat /proc/sys/net/ipv6/conf/lo/disable_ipv6)" == "1" ]]; then
  if sysctl -w net.ipv6.conf.all.disable_ipv6=0 \
             net.ipv6.conf.default.disable_ipv6=0 \
             net.ipv6.conf.lo.disable_ipv6=0 >/dev/null 2>&1; then
    echo "Enabled IPv6 on loopback (::1) for Cloudflare workerd."
  else
    echo "WARNING: IPv6 loopback is disabled and could not be enabled." >&2
    echo "         workerd may fail with: Cannot assign requested address [::1]:0" >&2
    echo "         Run as root: sysctl -w net.ipv6.conf.lo.disable_ipv6=0" >&2
  fi
fi
