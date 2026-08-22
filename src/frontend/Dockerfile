# Use official Node.js image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all frontend files into the container
COPY . .

# Expose the port Vite runs on
EXPOSE 5173

# Start the Vite development server (exposed to host)
CMD ["npm", "run", "dev", "--", "--host"]