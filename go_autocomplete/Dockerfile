FROM golang:1.25.1-alpine AS build

ARG GO_AUTOCOMPLETE_REF=6d8bad11cb83e264ecf8286f70a99cb7975ad37e

RUN apk add --no-cache git

WORKDIR /src

RUN git clone https://github.com/noahtigner/go-autocomplete.git . && \
    git checkout --detach "$GO_AUTOCOMPLETE_REF"

RUN CGO_ENABLED=0 go build -trimpath -ldflags='-s -w' -o /out/go-autocomplete . && \
    CGO_ENABLED=0 go build -trimpath -ldflags='-s -w' -o /out/go-autocomplete-etl ./cmd/etl

FROM alpine:3.22

RUN apk add --no-cache ca-certificates

WORKDIR /app

COPY --from=build /out/go-autocomplete /out/go-autocomplete-etl ./
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint

RUN chmod +x /usr/local/bin/docker-entrypoint

VOLUME ["/app/data"]

EXPOSE 8090

HEALTHCHECK --interval=30s --timeout=5s --start-period=10m --retries=3 \
    CMD wget -q -O /dev/null http://localhost:8090/hello || exit 1

ENTRYPOINT ["/usr/local/bin/docker-entrypoint"]
