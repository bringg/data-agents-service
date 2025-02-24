FROM bringg/node:20-alpine
LABEL maintainer "Bringg DevOps <devops@bringg.com>"

EXPOSE 3001

# provide a non-root user to run the process.
ENTRYPOINT ["gosu", "node"]

# default command to invoke
CMD ["npm", "start"]

# create working dir and set "node" as an owner
WORKDIR /opt/src
RUN chown node:node .

# first copy 'package*.json' so npm install will work
COPY package*.json .

# handle dependencies
# the following will be cached as long as package.json was not changed
RUN --mount=type=secret,id=npmrc,target=.npmrc \
    apk add --no-cache ca-certificates \
    && apk --no-cache -X https://dl-cdn.alpinelinux.org/alpine/edge/testing add gosu \
    && apk add --no-cache -t .build-deps build-base git python3 \
    && npm ci --omit=dev \
    && wget -P /usr/local/share/ca-certificates http://bringg-devops-provision.s3.amazonaws.com/public/automation-ca.crt \
    && update-ca-certificates \
    && apk del --purge .build-deps \
    && rm -Rf /tmp/npm-*

# copy all application files
COPY --chown=node:node . .

# declare ARGS that must be specified during build
ARG BUILD_TAG
ARG DEPLOY_ENV
ARG REVISION

# define environment variables
ENV BUILD_TAG=$BUILD_TAG \
    NODE_ENV=$DEPLOY_ENV \
    SHA1=$REVISION
