FROM node:14.16.0 as build-stage

WORKDIR /
COPY ./package.json ./
#COPY ./yarn.lock ./
#RUN npm install -g yarn
RUN npm install -g typescript
RUN npm install -g npm-run-all
RUN yarn install --force
COPY . ./
#RUN yarn build

CMD ["yarn", "start"]