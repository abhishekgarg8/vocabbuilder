# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Set environment variable to skip Puppeteer Chromium download
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Install dependencies
RUN npm install

# Copy the entire project directory
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Run the application
CMD ["node", "src/index.js"]
