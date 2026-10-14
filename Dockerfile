FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . ./

# O Vite injecta as variaveis VITE_* no bundle em tempo de build, por isso tem
# de vir como build args e nao como variaveis de ambiente do contentor.
ARG VITE_HOST_API
ARG VITE_ASSETS_API
ENV VITE_HOST_API=$VITE_HOST_API
ENV VITE_ASSETS_API=$VITE_ASSETS_API

RUN npm run build

# ----------------------------------------------------------------------

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
