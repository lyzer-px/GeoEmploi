FROM node:24-alpine

WORKDIR /code/frontend

COPY . .

RUN npm install

EXPOSE 8000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8000"]