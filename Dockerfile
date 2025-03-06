FROM node:22.11.0-alpine AS base

# setup docker image to install all node packages
FROM base AS dependencies

WORKDIR /app

COPY package*.json ./

RUN npm install


# setup docker image for next.js build
# FROM base AS build
# WORKDIR /app
# COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# ENV NEXT_TELEMETRY_DISABLED=1
ENV INNGEST_DEV=1
ENV INNGEST_BASE_URL=http://inngest:8288
ENV Site_Url=http://nextjs-app:3000
ENV DB_USER=postgres
ENV DB_HOST=postgres
ENV DB_NAME=Donor_Db
ENV DB_PASSWORD=mysecretpassword
ENV DB_PORT=5432
ENV API_KEY=rkdxmdjvwymdqqbhzxsztpxqmamradxozovnymkdppsxuxexiqcmdtmgvmvcyfncgsnfiikgwkdanbswwocmczvpqhisihxezuvmesreagxxisyoakbjpqqvmhdzbzpps

RUN npm run build

# # setup docker image to hold build, static and run the app
# FROM base AS runner
# WORKDIR /app

# ENV NODE_ENV=production \
#     NEXT_TELEMETRY_DISABLED=1 \
#     HOSTNAME="0.0.0.0"

# COPY --from=build /app/public ./public

# RUN mkdir .next

# COPY --from=build /app/.next/standalone ./
# COPY --from=build /app/.next/static ./.next/static

CMD ["npm", "run", "start"]