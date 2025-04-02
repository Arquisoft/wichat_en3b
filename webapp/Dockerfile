FROM node:22

COPY . /app
WORKDIR /app

ARG REACT_APP_API_ENDPOINT
ENV REACT_APP_API_ENDPOINT=${REACT_APP_API_ENDPOINT}

#Install the dependencies
RUN npm install

#Create an optimized version of the webapp
RUN npm run build

#Expose the port the app runs on
EXPOSE 3000

#Execute npm run prod to run the server
CMD [ "npm", "run", "prod" ]