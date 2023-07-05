# syntax = docker/dockerfile:1
ARG NODE_VERSION=20.1.0
FROM node:${NODE_VERSION}-slim as base
LABEL fly_launch_runtime="NodeJS"
WORKDIR /app

# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install -y python-is-python3 pkg-config build-essential

COPY package.json .
COPY yarn.lock .
RUN yarn

COPY --link . .

RUN rm -rf packages/wallet
RUN rm -rf packages/contracts

RUN yarn
RUN yarn build:dependencies
RUN npm prune --production

# Final stage for app image
FROM base
RUN apt-get update -q && apt-get install -y sqlite3

# Copy built application
COPY --from=build /app /app
ENV NODE_ENV=production
WORKDIR /app/packages/node
CMD [ "yarn", "start", "src/config/prodStateSetup.json" ]
