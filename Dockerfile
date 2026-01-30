# Build Stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Generate Prisma Client
RUN npm run db:generate

# Build the application
RUN npm run build

# Runtime Stage
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy built files and dependencies
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma

# Expose the API port
EXPOSE 3000

# Start the application
# We use node directly to avoid pino-pretty in production logs (standard practice)
CMD ["node", "dist/src/server.js"]
