# Build context must be the REPO ROOT (the API depends on ../shared):
#   docker build -f Backend/Dockerfile -t crm-api .
FROM node:22-alpine AS build
WORKDIR /app
COPY shared ./shared
RUN cd shared && npm install && npm run build
COPY Backend ./Backend
RUN cd Backend && npm install && npx prisma generate && npm run build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app/Backend
COPY --from=build /app/shared /app/shared
COPY --from=build /app/Backend/package*.json ./
COPY --from=build /app/Backend/node_modules ./node_modules
COPY --from=build /app/Backend/dist ./dist
COPY --from=build /app/Backend/prisma ./prisma
EXPOSE 3001
CMD ["node", "dist/main.js"]
