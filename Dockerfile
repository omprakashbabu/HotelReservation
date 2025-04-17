# Use the official Node.js image
FROM node:18

# Install git
RUN apt-get update && apt-get install -y git

# Clone your GitHub repository (replace with your actual repo URL)
https://github.com/omprakashbabu/HotelReservation.git /app

# Set working directory
WORKDIR /app

# Install dependencies and nodemon globally
RUN npm install -g nodemon && npm install

# Expose the port the app runs on
EXPOSE 80

# Run the app using nodemon
CMD ["nodemon", "src/index.js"]
