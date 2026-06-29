# Build context must be the REPO ROOT (the app depends on ../shared):
#   docker build -f Frontend/Dockerfile -t crm-web .
FROM node:22-alpine AS build
WORKDIR /app
COPY shared ./shared
RUN cd shared && npm install && npm run build
COPY Frontend ./Frontend
RUN cd Frontend && npm install && npm run build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app/Frontend
COPY --from=build /app/shared /app/shared
COPY --from=build /app/Frontend/package*.json ./
COPY --from=build /app/Frontend/node_modules ./node_modules
COPY --from=build /app/Frontend/.next ./.next
COPY --from=build /app/Frontend/public ./public
EXPOSE 3000
CMD ["npm", "run", "start"]
