<h1 align="center">homelab</h1>

<p align="center">Docker services that I run at home to improve my QoL</p>

[![Code Quality Checks](https://github.com/noahtigner/homelab/actions/workflows/quality.yml/badge.svg)](https://github.com/noahtigner/homelab/actions/workflows/quality.yml)
[![CodeQL](https://github.com/noahtigner/homelab/actions/workflows/codeql.yml/badge.svg)](https://github.com/noahtigner/homelab/actions/workflows/codeql.yml)

# Services:

- [x] [Pi-hole](https://pi-hole.net/) - Network-wide ad blocking & tracking prevention
- [x] REST API - API for homelab services, built with [FastAPI](https://fastapi.tiangolo.com/)
  - [x] Hardware, Network, and Docker Diagnostics
  - [x] Interface for interacting with the Pi-hole API
  - [x] Interface for interacting with the GitHub API
  - [x] Interface for interacting with the LeetCode API
  - [ ] Internet Speed Test
- [ ] Dashboard - Dashboard for homelab services, built with [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), and [Vite](https://vitejs.dev/)
  - [x] displays Pi-hole stats
  - [x] displays hardware, network, and docker diagnostics
  - [ ] displays GitHub stats
  - [x] displays LeetCode stats
  - [ ] displays internet speed test results
- [x] [Traefik](https://traefik.io/) - Reverse proxy
- [x] [whoami](https://hub.docker.com/r/containous/whoami) - Simple HTTP service that prints OS info and HTTP request to output
- [ ] Cache
- [ ] DB
- [ ] Slack Bot

# Attribution

[![Pi-hole](https://github.com/noahtigner/homelab/blob/main/dashboard/public/pihole.svg)](https://pi-hole.net/)
