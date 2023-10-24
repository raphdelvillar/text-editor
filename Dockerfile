# Multi-stage
# 1) Node image for building frontend assets
# 2) nginx stage to serve frontend assets

# Name the node stage "builder"
FROM node:alpine as builder

# Set working directory
WORKDIR /app

COPY yarn.lock ./

# install node modules
RUN yarn install

# Copy all files from current directory to working dir in image
COPY . ./

# create build without sourcemaps
ENV GENERATE_SOURCEMAP=false
RUN yarn build

# nginx state for serving content
FROM nginx:alpine

ARG USER=deployment
ARG GROUP=deployment

# This is to create a non-privilege user
RUN addgroup -S $GROUP && adduser -S $USER -G $GROUP

# Set the permissions for the non-privileged user
RUN touch /var/run/nginx.pid && \
    chmod 550 /usr/share/nginx/html && \
    chmod 550 /etc/nginx && \
    chmod 770 /var/cache/nginx && \
    chmod 770 /var/run/nginx.pid && \
    chown -R $USER:$GROUP /usr/share/nginx/html /etc/nginx /var/run /var/run/nginx.pid /var/cache/nginx

# Copy static assets from builder stage
RUN mkdir -p /usr/share/nginx/html && \
    rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
RUN rm -rf /app

# set current user as the non-privilege user
USER $USER

# Set working directory to nginx asset directory
WORKDIR /usr/share/nginx/html

# Copy nginx config for React app that uses router
RUN rm /etc/nginx/conf.d/default.conf
COPY ./nginx.conf /etc/nginx/conf.d

# Containers run nginx with global directives and daemon off
ENTRYPOINT ["nginx", "-g", "daemon off;"]
EXPOSE 80