# Use the official Node.js LTS image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json first for dependency caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Install nodemon globally (since you're using it to run the app)
RUN npm install -g nodemon

# Copy the rest of the project files
COPY . .

# Expose the port your app runs on (adjust if needed)
EXPOSE 80

# Start the application using nodemon
CMD ["nodemon", "src/index.js"]
