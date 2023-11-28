FROM node:20-slim
# ENV PNPM_HOME="/pnpm"
# ENV PATH="$PNPM_HOME:$PATH"
# RUN corepack enable
# COPY . /app

# Update npm | Install pnpm
# RUN npm i -g npm@latest; \
#  # Install pnpm
#  npm install -g pnpm; \
#  pnpm --version; \
#  pnpm setup; \
#  mkdir -p /usr/local/share/pnpm &&\
#  export PNPM_HOME="/usr/local/share/pnpm" &&\
#  export PATH="$PNPM_HOME:$PATH"; \
#  pnpm bin -g
#  # Install dependencies
# #  pnpm add -g pm2 &&\
# #  pnpm add -g @nestjs/cli &&\
# #  pnpm install

COPY ./package.json /app/package.json
# COPY package-lock.json /app/package-lock.json

WORKDIR /app

RUN npm install
