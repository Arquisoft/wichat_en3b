FROM node:22

COPY . /app
WORKDIR /app

ARG API_URI="http://localhost:8000"
ENV REACT_APP_API_ENDPOINT=$API_URI

#Install the dependencies
RUN npm install

#Create an optimized version of the webapp
RUN npm run build

#Expose the port the app runs on
EXPOSE 3000

#Execute npm run prod to run the server
CMD [ "npm", "run", "prod" ]