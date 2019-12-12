###builder
FROM node:alpine as builder

COPY web/package.json web/package-lock.json ./

## Storing node modules on a separate layer will prevent unnecessary npm installs at each build
RUN npm ci && mkdir /ng-app && mv ./node_modules ./ng-app

WORKDIR /ng-app

COPY web/src ./src/
COPY web/angular.json .
COPY web/browserslist .
COPY web/karma.conf.js .
COPY web/ngsw-config.json .
COPY web/ts* ./
COPY web/package.json web/package-lock.json ./

RUN npm run ng build -- --prod --output-path=dist


FROM node:alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY index.js .
COPY config.js .
COPY --from=builder /ng-app/dist ./public

EXPOSE 8080
CMD [ "npm", "start" ]
