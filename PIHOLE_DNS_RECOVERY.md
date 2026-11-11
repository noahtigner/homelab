# Pi-hole recovery after an Ubuntu upgrade

## What happened

After an Ubuntu upgrade on November 10, 2026, Pi-hole could not start:

```text
failed to bind host port 0.0.0.0:53/tcp: address already in use
```

The upgrade replaced `/etc/systemd/resolved.conf`, removing a local override:

```diff
-DNSStubListener=no
+#DNSStubListener=yes
```

The commented line does not disable the listener: it restores the default of **enabled**. Ubuntu's `systemd-resolved` consequently listened on `127.0.0.53:53` and `127.0.0.54:53`, over both TCP and UDP.

In [compose.pro.yml](compose.pro.yml), Pi-hole publishes `53:53/tcp` and `53:53/udp`. Without an explicit host IP, Docker publishes on all host IPv4 addresses (`0.0.0.0`), which overlaps those loopback listeners. Docker therefore could not bind the ports.

## Why the fix has two parts

1. **Disable only the DNS stub listener.** Keep `systemd-resolved` running so it can continue managing upstream DNS information. Put the override in `/etc/systemd/resolved.conf.d/99-pihole.conf`, separate from the package-managed main configuration file, so a future replacement of that file does not remove the customization.
2. **Point `/etc/resolv.conf` at the upstream-resolver file.** It originally linked to `/run/systemd/resolve/stub-resolv.conf`, which tells applications to query `127.0.0.53`. Disabling that listener without changing the symlink can break host DNS. Linking to `/run/systemd/resolve/resolv.conf` instead lets applications query the configured upstream servers directly.

At recovery time, the upstream file listed `1.1.1.1`. This also allows the host to resolve names while Pi-hole is stopped. The symlink does not hard-code that address; `systemd-resolved` continues maintaining the target file from the host's DNS configuration. This setup does not route the host's own DNS through Pi-hole, and the upstream file does not preserve per-interface split-DNS routing semantics.

## 1. Confirm the conflict

Run Compose commands from the repository root.

```bash
sudo ss -lntup '( sport = :53 )'
systemctl status systemd-resolved --no-pager
systemd-analyze cat-config systemd/resolved.conf
ls -l /etc/resolv.conf
cat /run/systemd/resolve/resolv.conf
docker compose -f compose.dev.yml -f compose.pro.yml ps -a
```

Look for the stub listener addresses above, no effective `DNSStubListener=no` override, and Pi-hole in `Created` or another non-running state. Confirm that the upstream-resolver file contains a usable DNS server before proceeding. If Pi-hole is already working, seeing Docker's port 53 listeners is expected and is not this conflict.

## 2. Back up the current configuration

Run the following commands in the same shell so `$BACKUP` remains available. Preserve the `/etc/resolv.conf` **symlink itself**, not just its target's contents.

```bash
BACKUP=$(sudo mktemp -d /etc/systemd/pihole-resolver-backup.XXXXXX)
sudo cp -a --no-dereference /etc/resolv.conf "$BACKUP/resolv.conf"

if sudo test -e /etc/systemd/resolved.conf.d/99-pihole.conf; then
    sudo cp -a /etc/systemd/resolved.conf.d/99-pihole.conf "$BACKUP/99-pihole.conf"
fi

printf 'Resolver backup: %s\n' "$BACKUP"
```

If a Pi-hole drop-in already exists, inspect it before replacing it and preserve any other intentional settings.

## 3. Apply the persistent resolver fix

```bash
sudo install -d -m 0755 /etc/systemd/resolved.conf.d
sudo tee /etc/systemd/resolved.conf.d/99-pihole.conf >/dev/null <<'EOF'
[Resolve]
DNSStubListener=no
EOF

sudo ln -sfn /run/systemd/resolve/resolv.conf /etc/resolv.conf
sudo systemctl restart systemd-resolved
```

The symlink is changed before restarting the service so applications no longer depend on the stub listener when it is disabled.

Verify before starting Pi-hole:

```bash
systemctl is-active systemd-resolved
sudo ss -lntup '( sport = :53 )'
timeout 20 getent ahostsv4 ubuntu.com
```

Expect `active`, no port 53 listeners while Pi-hole is stopped, and IP addresses for `ubuntu.com`. If host DNS fails, use the rollback instructions below before continuing.

## 4. Start Pi-hole and check Docker networking

When the container already exists, start it and wait for its health check:

```bash
docker compose -f compose.dev.yml -f compose.pro.yml start --wait --wait-timeout 120 pihole
docker compose -f compose.dev.yml -f compose.pro.yml ps -a
```

If the container does not exist, create and start it with:

```bash
docker compose -f compose.dev.yml -f compose.pro.yml up -d pihole
```

### If Pi-hole is healthy but unreachable

During this incident, starting the previously failed container reported **healthy**, but DNS and HTTP connections from the host were refused. Inspection showed that it had no attached Docker network and no active published ports:

```bash
docker inspect --format 'Networks={{json .NetworkSettings.Networks}} PublishedPorts={{json .NetworkSettings.Ports}}' pihole
```

Both fields were `{}`. Pi-hole's internal health check passed because its DNS process was running inside the container; that did not verify host port publishing or external connectivity.

Reconnect the container **only if inspection confirms this missing-network state**:

```bash
docker network connect --alias pihole homelab_default pihole
```

`homelab_default` is this deployment's Compose network. If the Compose project name differs, use `docker network ls` and inspect a working service to identify the correct network. Reconnecting restored the published ports without recreating the container.

## 5. Verify actual service access

```bash
# Pi-hole must resolve queries through its published host port, over UDP and TCP.
dig @127.0.0.1 ubuntu.com A +time=3 +tries=1
dig @127.0.0.1 ubuntu.com A +tcp +time=3 +tries=1

# The admin UI should return HTTP 200 after following the login redirect.
curl --silent --show-error --location --output /dev/null \
    --write-out 'Pi-hole admin HTTP status: %{http_code}\n' \
    --max-time 10 http://127.0.0.1:84/admin/

# The host must still resolve names independently.
getent ahostsv4 ubuntu.com

docker compose -f compose.dev.yml -f compose.pro.yml ps -a
```

Both `dig` commands should return `status: NOERROR` with answers. Compose should show Pi-hole as healthy with published ports `53/tcp`, `53/udp`, `84 -> 80/tcp`, and `443/tcp`. For LAN verification, query the server's LAN IP from another device as well.

All local checks above passed during this recovery, and all Compose containers were running afterward.

## Rollback

Stop Pi-hole first to free port 53 before re-enabling the original stub listener. Set `BACKUP` to the directory printed during the backup step. The backup from this incident is `/etc/systemd/pihole-resolver-backup.7ySVmS`.

```bash
BACKUP=/etc/systemd/pihole-resolver-backup.7ySVmS
sudo test -e "$BACKUP/resolv.conf"
```

Continue only if the backup exists:

```bash
docker compose -f compose.dev.yml -f compose.pro.yml stop pihole

sudo rm -f /etc/systemd/resolved.conf.d/99-pihole.conf
if sudo test -e "$BACKUP/99-pihole.conf"; then
    sudo cp -a "$BACKUP/99-pihole.conf" /etc/systemd/resolved.conf.d/99-pihole.conf
fi

sudo rm -f /etc/resolv.conf
sudo cp -a --no-dereference "$BACKUP/resolv.conf" /etc/resolv.conf
sudo systemctl restart systemd-resolved
getent ahostsv4 ubuntu.com
```

Rollback restores the previous resolver setup, including the original port conflict if the stub listener was enabled. Pi-hole remains stopped until that conflict is addressed again.
