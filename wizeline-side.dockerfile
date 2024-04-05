# Use the official Node.js image as the base image for the build step to be used later
FROM --platform=linux/amd64 node:16.20.2 as build

# Set the working directory in the container for the build step to /app
WORKDIR /app

# Make sure cache is clean before attempting any NPM work
RUN npm cache clean --force

# Copy the entire project to the container for the build step
COPY . .

# Install project dependencies
RUN npm install && \
    npm install -g @angular/cli@16.1.8

# Generate index.html in src directory
#RUN npm run gen-local-bottom
# Build the Angular app for deployment to transfer it over to the final step
RUN ng build bottom-side-ui --configuration=store

# Use a smaller, deployment-ready image as the final image this reducse the size of the image by 8GB~
FROM --platform=linux/amd64 nginx:alpine

# Copy the modified default.conf to the NGINX configuration directory
COPY default.conf /etc/nginx/conf.d/default.conf

COPY bottom-side-nginx.conf /etc/nginx/nginx.conf

# Copy the deployment-ready Angular app to the Nginx webserver's root directory to be served
COPY --from=build /app/dist/apps/bottom-side-ui /usr/share/nginx/html

# # Copy the generated index.html from the .immutable folder to the correct location
# COPY --from=build /app/apps/bottom-side-ui/.immutable/index.html /usr/share/nginx/html/index.html


# Expose port 80 so localhost:80 will redirect you via NGINX to the bottom-side-ui we provided it in the step above.
EXPOSE 80

# Start Nginx when the container is ran
CMD ["nginx", "-g", "daemon off;"]
