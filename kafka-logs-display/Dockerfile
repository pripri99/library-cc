# Use the official Node.js image as the base image for the build stage
FROM node:14 as build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app files to the working directory
COPY . .

# Build the React app for production
RUN npm run build

# Use the official Nginx image for the runtime stage
FROM nginx:stable-alpine

# Copy the built React app from the build stage to the Nginx HTML directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose the port the app runs on
EXPOSE 3001

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
