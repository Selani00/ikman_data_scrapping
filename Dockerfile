# Use the official Node.js image from the Docker Hub
FROM node:latest

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port that the app runs on
EXPOSE 9090

# Define environment variable
ENV PORT 9090

# Command to run the application
CMD ["node", "test.js"]
