
## Apache Answer 1-day test: skipped 20 Oct 2026

Skipped: route (b) was chosen and the demo is live, so the test no longer changes the decision.
Reasons:
1. The GitHub release asset's checksum did not match Apache's published SHA-512 (the downloads.apache.org tarball did match). The GitHub asset was discarded, never run.
2. The Answer installer binds port 80 on all interfaces with no flag to change it, so it cannot be run localhost-only without stopping local services or exposing the installer.
Signature (.asc) was not checked (no gpg on the machine). RTL layout of Answer was not tested.
