# first build front end to production
# after that create new docker env and copy files 
# in server folder to app folder
# then copy the built client to app folder
# finally, serve
FROM node:lts-alpine AS builder

WORKDIR /client

ADD client .

RUN npm install --omit=dev

ENV REACT_APP_API_URL=v1

RUN npm run build

FROM node:lts-alpine

WORKDIR /app

ADD server .

RUN npm install --omit=dev

COPY --from=builder /client/build ./public

USER node

CMD [ "npm","start" ]

EXPOSE 8000