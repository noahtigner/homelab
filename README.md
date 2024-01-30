<h1 align="center">homelab</h1>

<p align="center">Docker services that I run at home to improve my QoL</p>

<div align="center">

[![Code Quality Checks](https://github.com/noahtigner/homelab/actions/workflows/quality.yml/badge.svg)](https://github.com/noahtigner/homelab/actions/workflows/quality.yml)
[![CodeQL](https://github.com/noahtigner/homelab/actions/workflows/codeql.yml/badge.svg)](https://github.com/noahtigner/homelab/actions/workflows/codeql.yml)

</div>

# Services:

- [x] [Pi-hole](https://pi-hole.net/) - Network-wide ad blocking & tracking prevention
- [x] REST API - API for homelab services, built with [FastAPI](https://fastapi.tiangolo.com/)
  - [x] Hardware, Network, and Docker Diagnostics
  - [x] Interface for interacting with the Pi-hole API
  - [x] Interface for interacting with the GitHub API
  - [x] Interface for interacting with the LeetCode API
  - [ ] Internet Speed Test
- [x] Dashboard - Dashboard for homelab services, built with [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), and [Vite](https://vitejs.dev/)
  - [x] displays Pi-hole stats
  - [x] displays hardware, network, and docker diagnostics
  - [x] displays GitHub stats
  - [x] displays LeetCode stats
  - [ ] displays internet speed test results
- [x] [Traefik](https://traefik.io/) - Reverse proxy
- [x] [whoami](https://hub.docker.com/r/containous/whoami) - Simple HTTP service that prints OS info and HTTP request to output
- [x] [Slack](https://slack.com/) Bot - Bot for interacting with homelab services
- [x] [Redis Cache](https://redis.io/) - Cache for homelab services
- [ ] DB

# Attribution

<a href="https://pi-hole.net/"><img alt="Pi-hole" src="https://github.com/noahtigner/homelab/blob/main/dashboard/public/pihole.svg" height="32" /></a>
<a href="https://fastapi.tiangolo.com/"><img alt="FastAPI" src="https://github.com/noahtigner/homelab/blob/main/dashboard/public/fastapi.svg" height="32" /></a>
<a href="https://reactjs.org/"><img alt="React" src="https://github.com/noahtigner/homelab/blob/main/dashboard/src/assets/react.svg" height="32" /></a>
<a href="https://vitejs.dev/"><img alt="Vite" src="https://github.com/noahtigner/homelab/blob/main/dashboard/public/vite.svg" height="32" /></a>
