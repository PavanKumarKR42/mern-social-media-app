# Use Node.js official image
FROM node:16

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY frontend/ .

# Expose the frontend port (usually 3000)
EXPOSE 3000

# Build the project for production
RUN npm run build

# Serve the built frontend app (using serve)
CMD ["npx", "serve", "-s", "build", "-l", "3000", "--single"]
