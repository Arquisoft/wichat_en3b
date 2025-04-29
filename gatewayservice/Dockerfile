# Use an official Node.js runtime as a parent image
FROM node:22

# Set the working directory in the container
WORKDIR /usr/src/gatewayservice

# Set environment variables
ARG FRONTEND_URL
ENV FRONTEND_URL=${FRONTEND_URL}
ENV ACCESS_TOKEN_SECRET="accessTokenSecret"

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the app source code to the working directory
COPY . .

# Define the command to run your app
CMD ["node", "gateway-service.js"]
