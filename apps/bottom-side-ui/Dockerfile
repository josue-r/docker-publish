FROM node:16.20.2 as build
ARG APP_VERSION
ARG APP_HOST
RUN npm i -g @immutablewebapps/ejs-cli@0.0.2
COPY .immutable/config.json /config.json
# Replace the app_host and app_version placeholders in the config with the given arguments
RUN sed -i "s|{{APP_HOST}}|$APP_HOST|;s|{{APP_VERSION}}|$APP_VERSION|" /config.json
# Fetch the deployed index.ejs to build the deployment html
RUN curl $APP_HOST/$APP_VERSION/index.ejs | iwa-ejs --d config.json > index.html

# Using a custom vioc nginx image
# This should attempt to use the regular nginx image on next upgrade to see if vulnerability has been patched
FROM ghcr.io/valvoline-llc/vioc-nginx:1.25-alpine-latest
# gettext is needed to get envsubst
# moreutils is needed to get sponge
RUN apk update && \
    apk add gettext && \
    apk add moreutils
RUN rm -rf /usr/share/nginx/html/*
# Copy needed assets from the build container
COPY --from=build index.html /usr/share/nginx/html/index.html
COPY nginx.conf /etc/nginx/nginx.conf

# Give the nginx user the needed permissions to run nginx
RUN touch /var/run/nginx.pid && \
  chown -R nginx:nginx /var/run/nginx.pid && \
  chown -R nginx:nginx /var/cache/nginx && \
  chown nginx:nginx /usr/share/nginx/html/index.html
# Run the container as the nginx user
USER 101
# To start container run enbsubst to replace all environment placeholders in the index.html with environment
# variables supplied to the container, then start nginx.
# sponge is used to ensure everything is written to stdin before writing to the file, prevents sometimes ending up
# with an empty file
CMD envsubst < /usr/share/nginx/html/index.html | sponge /usr/share/nginx/html/index.html && nginx -g "daemon off;"