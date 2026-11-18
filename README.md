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

## Pi-hole dashboard

The Pi-hole DNS Ad Blocking card combines rolling 24-hour query totals, query rate, blocked percentage, blocked-domain count, and client count. Its compact 90px chart uses filled total-query (mint) and blocked-query (amber) series on a shared zero-based scale. The blocked series is drawn last so its fill and line remain on top of the total series.

`GET /pihole/history/` proxies Pi-hole v6's `/api/history/database` for the previous 24 hours using the existing Pi-hole session authentication. It returns `window_start`, `window_end`, `interval_seconds` (600), and a `history` array of `{timestamp, total, blocked}` buckets. Timestamps are Unix seconds. Results are cached for 30 seconds, and the dashboard polls every 30 seconds. The chart connects recorded buckets across missing intervals, with tooltips showing only recorded counts. History failures leave summary values visible. Compact metrics wrap onto additional rows on smaller screens.

## LeetCode activity calendar

The full-width LeetCode card above GitHub combines all-time solved totals, three compact Easy/Medium/Hard progress tiles, language chips, and the activity calendar. "Beats" percentages are omitted; difficulty denominators are shown from the `sm` breakpoint upward and hidden on narrow screens. Both activity calendars use exactly 366 dates ending on the current date in `GENERIC_TIMEZONE` (UTC if unset), with empty padding only outside that range. Each completed LeetCode day's square uses the highest difficulty accepted: **green/teal for Easy, amber/orange for Medium, red for Hard**. A problem counts once per local date even if submitted successfully several times; accepting it on another date counts again. Failed attempts do not count. Difficulty is the current difficulty reported by LeetCode, not a historical classification.

Muted squares mean a confirmed day with no accepted problems. Hatched squares indicate unknown or partial history, including unresolved problem difficulties. Tooltips and selected-day details include the observed unique-problem count and Easy/Medium/Hard breakdown. The total is a sum of daily unique solves, not a lifetime distinct-problem total.

### Setup and history coverage

1. Sign in at `leetcode.com` as `LEETCODE_USERNAME`. Copy the `LEETCODE_SESSION` and `csrftoken` cookie values from the browser's developer tools.
2. Set `LEETCODE_SESSION` and `LEETCODE_CSRF_TOKEN` in the root `.env`. Alternatively, mount API secrets at `/run/secrets/leetcode_session` and `/run/secrets/leetcode_csrf_token`. Compose passes these credentials only to the API.
3. Set `GENERIC_TIMEZONE` to the desired IANA timezone, such as `America/Boise`, and apply:

   ```sh
   docker compose -f compose.dev.yml -f compose.pro.yml up -d --build --no-deps api dashboard
   ```

The API verifies that the authenticated account matches `LEETCODE_USERNAME` before reading history. It uses LeetCode's undocumented authenticated `submissionList` query, checks overlapping pages for continuity, and backfills in bounded background batches. The UI shows progress through observed data and explicit coverage states; a complete annual history is only shown after the upstream pages have actually covered the window. Availability and retention of historical submissions depend on LeetCode. The public calendar and recent-acceptance feed cannot establish annual per-day difficulty.

The named `leetcode_activity_data` volume persists submission IDs, timestamps, problem slugs, difficulty metadata, and synchronization checkpoints at `/app/data/leetcode.sqlite3`. Submitted code is not requested. `LEETCODE_ACTIVITY_DB` can override the path for standalone deployments. Refreshes run approximately every 15 minutes after backfill; unfinished batches continue at five-second intervals. Problem metadata is cached for 30 days, with unresolved difficulties retried after 15 minutes. Expired sessions produce an activity-specific message; replace both cookies and recreate the API to renew them.

Incremental refreshes reread 24 hours of already-covered history to pick up late judging results, with submission-ID deduplication preventing repeated counts.

`GET /leetcode/calendar/` returns date-only daily aggregates, coverage, timezone, last successful history-scan time, and sync status. It reads the durable snapshot rather than blocking on upstream pagination. `POST /leetcode/calendar/sync/` schedules another attempt, also available through **Sync now**. Snapshot polling is five seconds during incomplete synchronization and 15 minutes when ready. Account and date aggregation are isolated from the existing Redis response cache.

### Shared heatmap

`dashboard/src/components/charts/CalendarHeatmap.tsx` provides calendar geometry, month/day labels, responsive scrolling, keyboard navigation, accessible cells, and dark, bordered tooltips. Sources provide typed date entries, the date range, cell colors/styles, accessible labels, rich tooltip content, and a legend; selected-day content is also composable. GitHub and LeetCode use separate adapters and TanStack Query hooks, with shared date-window normalization. Missing dates are hatched rather than treated as confirmed zero activity. The shared component does not fetch data or assume a provider's counting or difficulty rules.

## GitHub contribution calendar

The GitHub card shows 366 dates in a Sunday–Saturday calendar, using GitHub's own daily counts and intensity levels. Extra boundary-week dates returned by GitHub are trimmed, and the displayed total is calculated over the visible date range. Hover or focus a square for its date and count; arrow keys move by day/week, and Home/End move to the first/last day. Tapping a day also updates the detail text beneath the grid. On smaller screens the calendar scrolls locally and starts at the latest dates. The card occupies a full-width row at the bottom of the dashboard.

### Setup

1. Create a [GitHub personal access token](https://docs.github.com/en/graphql/guides/forming-calls-with-graphql#authenticating-with-a-personal-access-token) that can read contribution data for `GITHUB_USERNAME`. Fine-grained tokens include public-repository read access. Private/internal contribution counts depend on the token's access and GitHub contribution-visibility settings; GitHub documents the classic `read:user` scope for those counts.
2. Set `GITHUB_TOKEN` in the repository-root `.env`. Compose passes it only to the API. Alternatively, mount the token at `/run/secrets/github_token` in the API container.
3. Apply the API and dashboard changes:

   ```sh
   docker compose -f compose.dev.yml -f compose.pro.yml up -d --build --no-deps api dashboard
   ```

`GET /github/contributions/` queries GitHub GraphQL's `contributionsCollection.contributionCalendar` and returns `username`, `window_start`, `window_end`, `total_contributions`, and `weeks`, each containing `first_day` and `days` with `date`, `weekday`, `contribution_count`, and `contribution_level`. Calendar dates are kept as date-only values. Successful responses are cached for one hour per username and local end date, and the dashboard checks every 15 minutes. Missing/expired credentials, rate limits, and upstream failures produce a calendar-specific message with a retry control.

The **Recent public activity** section uses the separate `/github/events/` feed. Its repository links and OSS/own contribution counters summarize a bounded sample of recent public events and can differ from the calendar's annual total. The events feed works independently of calendar configuration.

## Monarch Money

The API uses a saved Monarch browser session for `/money/accounts/`, `/money/portfolio/`, and `/money/net-worth-history/`. It sends the `session_id` and `csrftoken` cookies, a matching `X-CSRFToken` header, the Monarch app origin, and a browser-style User-Agent.

### Initial setup

1. Sign in at [app.monarch.com](https://app.monarch.com), open your browser's developer tools, and select the **Network** tab.
2. Navigate to an account page and inspect a successful request to `https://api.monarch.com/graphql`.
3. Copy the request's `session_id` cookie value into `secrets/monarchmoney_session_id.txt`.
4. Copy its `csrftoken` cookie value into `secrets/monarchmoney_csrf_token.txt`. This should match the request's `x-csrftoken` header. Obtain both values from the same browser session.

Each file should contain only the cookie value, without quotes, cookie names, or other headers. These files are covered by the existing `secrets/` Git ignore rule. The API loads them through Docker secrets; local runs can supply the equivalent `monarchmoney_session_id` and `monarchmoney_csrf_token` environment variables. These replace the former `monarchmoney_token` configuration.

Recreate the API container to load the new credentials. For development:

```sh
docker compose -f compose.dev.yml up -d --no-deps --force-recreate api
```

For production:

```sh
docker compose -f compose.dev.yml -f compose.pro.yml up -d --no-deps --force-recreate api
```

### Renewing a session

Session lifetime is currently unknown. When Monarch returns **401**, the API responds with **503** and renewal instructions, which the dashboard displays. Obtain a fresh pair of cookie values, replace both secret files, and recreate the API container using the command above. Settings are loaded at process startup, so editing the files alone does not reload credentials.

A **403** can instead indicate failed CSRF validation or request filtering. The API distinguishes those errors from an expired session and displays an appropriate message. It logs the failed operation and a controlled error message.

Accounts, portfolio, and net-worth history responses are cached for five minutes. After setup or renewal, verify the endpoints on a cache miss (allow existing cached entries to expire) to confirm that upstream authentication succeeds.

### Net-worth history

`GET /money/net-worth-history/?start_date=2026-05-10&end_date=2026-11-10` returns daily snapshots with `date`, `balance`, `assetsBalance`, and signed `liabilitiesBalance` fields inside a `snapshots` array. `end_date` is required; omit `start_date` for all available history. Each date range has its own cache entry. Daily granularity preserves the current partial month, which Monarch's adaptive monthly history can omit.

The dashboard chart appears above the money table and defaults to six months, with one month, three months, YTD, one year, and all time also available. The complete table sits in an "Account details" disclosure below the chart, collapsed by default. Expanding it preserves the selected chart range and reuses the already-loaded data. Bounds use the browser's local calendar date. The headline net worth uses the same current account data as the table and stays visible while ranges load. Change compares the first and last available snapshots; percentage change is shown only for a positive starting balance. Historical snapshots can differ from current account balances due to snapshot timing and account inclusion settings.

The chart derives a display series from the daily history: daily through six months, weekly through two years, and monthly for longer spans. Each bucket uses its last recorded snapshot, with the exact first and latest snapshots retained. Narrow charts can use multi-day/week/month buckets to stay within a width-based budget of 80–240 points. The resolution is shown beside the date range, and monotone interpolation softens the joins. Change calculations always use the full history's endpoints.

### Guest mode

Open the dashboard with `/?guest=true` to hide Monarch Money amounts by default; bookmark this URL on shared displays. The eye button on the right of the Monarch Money title toggles privacy and synchronizes `guest=true` or `guest=false` in the current URL without reloading. Refreshing or sharing that URL preserves the selected visibility. An absent, false, or invalid `guest` parameter shows amounts normally.

Guest mode masks the headline net worth, dollar and percentage change, and all dollar amounts in the account table. It also hides chart Y-axis labels and disables the chart tooltip. The chart trend, gridlines, dates, range selector, and account-details disclosure remain available, with layout space preserved for masked values. Toggling preserves the selected range and disclosure state. TanStack Router manages the typed URL state, alongside TanStack Query for the financial data.

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

Set `GO_AUTOCOMPLETE_CORS_ALLOWED_ORIGIN=https://noahtigner.com` in the root `.env`. The service will not start without it and applies CORS headers only for that exact origin.

```sh
docker compose -f compose.dev.yml -f compose.pro.yml up -d go_autocomplete cloudflared
```

Configure the Cloudflare tunnel's public hostname with service URL `http://go_autocomplete:8090`. Protect the public API at the Cloudflare edge:

1. In **Security** > **Security rules**, create a custom rule with the action **Block** and this expression. It prevents the upstream diagnostic routes from being public:

   ```txt
   http.host eq "autocomplete.noahtigner.com" and not (http.request.method eq "GET" and http.request.uri.path eq "/search")
   ```

2. In **Security** > **Security rules**, create a rate limiting rule for URI Path equal to `/search`. Count by IP and start with 20 requests per 10 seconds, blocking for 10 seconds. Tune it from traffic.

# Attribution

<a href="https://www.plex.tv/"><img alt="Pi-hole" src="https://www.plex.tv/wp-content/themes/plex/assets/img/favicons/favicon.ico" height="32" /></a>
<a href="https://pi-hole.net/"><img alt="Pi-hole" src="https://github.com/noahtigner/homelab/blob/main/dashboard/public/pihole.svg" height="32" /></a>
<a href="https://fastapi.tiangolo.com/"><img alt="FastAPI" src="https://github.com/noahtigner/homelab/blob/main/dashboard/public/fastapi.svg" height="32" /></a>
<a href="https://reactjs.org/"><img alt="React" src="https://github.com/noahtigner/homelab/blob/main/dashboard/src/assets/react.svg" height="32" /></a>
<a href="https://vitejs.dev/"><img alt="Vite" src="https://github.com/noahtigner/homelab/blob/main/dashboard/public/vite.svg" height="32" /></a>
<a href="https://traefik.io/"><img alt="Traefik" src="https://doc.traefik.io/traefik/assets/img/traefik.logo.png" height="32" /></a>
<a href="https://slack.com/"><img alt="Slack" src="https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png" height="32" /></a>
<a href="https://redis.io/"><img alt="Redis" src="https://github.com/noahtigner/homelab/blob/main/dashboard/public/redis.svg" height="32" /></a>
