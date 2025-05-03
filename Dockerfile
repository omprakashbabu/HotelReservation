# Use the official Node.js image
FROM node:18

# Install git (needed for cloning the repo)
RUN apt-get update && apt-get install -y git

# Clone your GitHub repository
RUN git clone https://github.com/omprakashbabu/HotelReservation.git /app

# Set the working directory
WORKDIR /app

# Install app dependencies
RUN npm install -g nodemon

# Install all necessary packages (you can also use package.json for this)
RUN npm install \
    express \
    hbs \
    mongoose \
    axios \
    node-fetch \
    csv-parser \
    paypal-rest-sdk \
    cors

# Expose the port your app runs on
EXPOSE 80

# Start the application
CMD ["nodemon", "src/index.js"]
