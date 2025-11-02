FROM node:20-slim AS dev

# configure pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g corepack@latest
RUN corepack enable

COPY package.json /app/package.json
COPY pnpm-lock.yaml /app/pnpm-lock.yaml
COPY .prettierignore /app/.prettierignore
COPY .prettierrc.json /app/.prettierrc.json

WORKDIR /app

# RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
RUN pnpm install

FROM dev as pro

COPY . /app
RUN pnpm install -g serve
# RUN pnpm build
