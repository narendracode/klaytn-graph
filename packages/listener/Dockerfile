FROM node:14.16.0 as build-stage

WORKDIR /
COPY ./package.json ./
RUN npm install -g typescript
RUN npm install -g npm-run-all
RUN yarn install --force
COPY . ./

CMD ["yarn", "start"]