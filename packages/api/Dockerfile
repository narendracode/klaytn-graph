FROM node:14.16.0 as build-stage

WORKDIR /
COPY ./package.json ./
RUN yarn install --force
COPY . ./
EXPOSE 5000
CMD ["yarn", "start"]