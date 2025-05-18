# Сборка frontend (этап 1)
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Web-сервер (этап 2)
FROM nginx:stable-alpine

# Копируем сборку React в nginx
COPY --from=build /app/build /usr/share/nginx/html

# Копируем кастомный конфиг nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
