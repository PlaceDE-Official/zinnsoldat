FROM node:20.5.0-bullseye-slim

WORKDIR /app

COPY package-lock.json .
COPY package.json .
RUN npm install

COPY . .

# Modify the code to use the env var
RUN sed -i 's/const zs_accessToken = "";/const zs_accessToken = process.env.ZN_TOKEN;/g' index.js
RUN cat index.js
USER 1000:1000

ENTRYPOINT [ "node", "index.js" ]