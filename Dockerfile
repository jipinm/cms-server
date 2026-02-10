FROM node

ENV TZ=Asia/Shanghai

ENV CI=true

WORKDIR /usr/src/app

COPY package.json .npmrc ./

RUN npm i

COPY . .

RUN npm run build

CMD [ "node", "./dist/src/main.js" ]

EXPOSE 3000
