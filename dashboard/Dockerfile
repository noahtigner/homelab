FROM node:20-slim as dev

# configure pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY package.json /app/package.json
COPY pnpm-lock.yaml /app/pnpm-lock.yaml

WORKDIR /app

# RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
RUN pnpm install

FROM dev as pro

COPY . /app
RUN pnpm install -g serve
# RUN pnpm build
