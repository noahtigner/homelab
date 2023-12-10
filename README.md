<h1 align="center">homelab</h1>

<p align="center">Docker services that I run at home to improve my QoL</p>

<p align="center">
  <a aria-label="CI code quality checks status" href="https://github.com/noahtigner/homelab/actions/workflows/quality.yml">
    <img alt="" src="https://github.com/noahtigner/homelab/actions/workflows/quality.yml/badge.svg">
  </a>
  <a aria-label="CI dependency scanning status" href="https://github.com/noahtigner/homelab/actions/workflows/codeql.yml">
    <img alt="" src="https://github.com/noahtigner/homelab/actions/workflows/codeql.yml/badge.svg">
  </a>
</p>

# Services:

-   [x] [Pi-hole](https://pi-hole.net/) - Network-wide ad blocking & tracking prevention
-   [x] REST API - API for homelab services, built with [FastAPI](https://fastapi.tiangolo.com/)
    -   [x] Hardware, Network, and Docker Diagnostics
    -   [x] Interface for interacting with the Pi-hole API
    -   [x] Interface for interacting with the GitHub API
    -   [x] Interface for interacting with the LeetCode API
    -   [ ] Internet Speed Test
-   [x] [Traefik](https://traefik.io/) - Reverse proxy
-   [x] [whoami](https://hub.docker.com/r/containous/whoami) - Simple HTTP service that prints OS info and HTTP request to output
-   [ ] Cache
-   [ ] DB
