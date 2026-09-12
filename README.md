<h1 align="center">homelab</h1>

<p align="center">Docker services that I run at home to improve my QoL</p>

<div align="center">

[![Code Quality Checks](https://github.com/noahtigner/homelab/actions/workflows/quality.yml/badge.svg)](https://github.com/noahtigner/homelab/actions/workflows/quality.yml)
[![CodeQL](https://github.com/noahtigner/homelab/actions/workflows/codeql.yml/badge.svg)](https://github.com/noahtigner/homelab/actions/workflows/codeql.yml)

</div>

# Services:

- [x] [Plex](https://www.plex.tv/) - Media Streaming Service
- [x] [Pi-hole](https://pi-hole.net/) - Network-wide ad blocking & tracking prevention
- [x] REST API - API for homelab services, built with [FastAPI](https://fastapi.tiangolo.com/)
  - [x] Hardware, Network, and Docker Diagnostics
  - [x] Interface for interacting with the Pi-hole API
  - [x] Interface for interacting with the GitHub API
  - [x] Interface for interacting with the LeetCode API
  - [x] Interface for interacting with the Google Analytics API
  - [x] Interface for interacting with Synology's various APIs for their NAS devices
- [x] Internet Speed Test
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
- [x] [go-autocomplete](https://github.com/noahtigner/go-autocomplete) - IMDb title autocomplete and substring search service
- [ ] DB

## go-autocomplete

Start the service with:

```sh
docker compose -f compose.dev.yml up -d --build go_autocomplete
```

It is available on the LAN at `http://SERVER_IP:8090`. Search IMDb titles with:

```sh
curl 'http://SERVER_IP:8090/search?q=Star+Wars&limit=10&genre=sci-fi&type=movie'
```

The first start downloads the IMDb title and ratings datasets, generates `movies.jsonl`, and builds the in-memory index. Generated data is retained in the `go_autocomplete_data` Docker volume, so later starts reuse it. The full index has historically required about 8.24 GiB of RAM at peak. IMDb data is subject to [IMDb's non-commercial dataset terms](https://developer.imdb.com/non-commercial-datasets/).

### Public endpoint

Production runs a Cloudflare Tunnel connector that routes `https://autocomplete.noahtigner.com` to the internal `go_autocomplete:8090` service. The connector token is stored in the ignored `secrets/cloudflare_tunnel_token.txt` file.

```sh
docker compose -f compose.dev.yml -f compose.pro.yml up -d go_autocomplete cloudflared
```

Configure the Cloudflare tunnel's public hostname with service URL `http://go_autocomplete:8090`. Protect the public API at the Cloudflare edge:

1. In **Security** > **Security rules**, create a custom rule with the action **Block** and this expression. It prevents the upstream diagnostic routes from being public:

   ```txt
   http.host eq "autocomplete.noahtigner.com" and not (http.request.method eq "GET" and http.request.uri.path eq "/search")
   ```

2. In **Security** > **Security rules**, create a rate limiting rule for URI Path equal to `/search`. Count by IP and start with 20 requests per 10 seconds, blocking for 10 seconds. Tune it from traffic.
3. In **Rules** > **Transform Rules** > **Modify Response Header**, add a rule matching `autocomplete.noahtigner.com` and `/search` that sets these headers. Use the portfolio's canonical origin if it is served from a different hostname:

   ```txt
   Access-Control-Allow-Origin: https://noahtigner.com
   Access-Control-Allow-Methods: GET
   ```

# Attribution

<a href="https://www.plex.tv/"><img alt="Pi-hole" src="https://www.plex.tv/wp-content/themes/plex/assets/img/favicons/favicon.ico" height="32" /></a>
<a href="https://pi-hole.net/"><img alt="Pi-hole" src="https://github.com/noahtigner/homelab/blob/main/dashboard/public/pihole.svg" height="32" /></a>
<a href="https://fastapi.tiangolo.com/"><img alt="FastAPI" src="https://github.com/noahtigner/homelab/blob/main/dashboard/public/fastapi.svg" height="32" /></a>
<a href="https://reactjs.org/"><img alt="React" src="https://github.com/noahtigner/homelab/blob/main/dashboard/src/assets/react.svg" height="32" /></a>
<a href="https://vitejs.dev/"><img alt="Vite" src="https://github.com/noahtigner/homelab/blob/main/dashboard/public/vite.svg" height="32" /></a>
<a href="https://traefik.io/"><img alt="Traefik" src="https://doc.traefik.io/traefik/assets/img/traefik.logo.png" height="32" /></a>
<a href="https://slack.com/"><img alt="Slack" src="https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png" height="32" /></a>
<a href="https://redis.io/"><img alt="Redis" src="https://github.com/noahtigner/homelab/blob/main/dashboard/public/redis.svg" height="32" /></a>
