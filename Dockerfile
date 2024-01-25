# Use a specific version of node image from Docker Hub
FROM node:16-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project
COPY . .

# Build the TypeScript project
# This step assumes you have a script named "build" in your package.json
RUN npm run build

# Expose the port the app runs on
EXPOSE 3001

# Command to run the app
# This should be the path to the compiled JavaScript file in the dist directory
CMD ["node", "dist/index.js"]
