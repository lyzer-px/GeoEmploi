FROM node:24-alpine

WORKDIR /code/frontend

COPY ./package.json  /code/frontend/package.json

COPY ./.dsfr.yml /code/frontend/.dsfr.yml

RUN npm install

COPY ./src /code/frontend/src

EXPOSE 8080

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8080"]