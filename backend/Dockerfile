# Use Node.js official image
FROM node:16

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json
COPY backend/package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps


# Copy the rest of the backend code
COPY backend/ .

# Expose the backend port (usually 5000)
EXPOSE 5000

# Command to run the backend
CMD ["npm", "start"]
