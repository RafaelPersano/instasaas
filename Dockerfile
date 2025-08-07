
# Stage 1: Build the React app
FROM node:18-alpine AS builder

WORKDIR /app

# Declare build arguments that can be passed from docker-compose
ARG API_KEY
ARG SUPABASE_URL
ARG SUPABASE_ANON_KEY

# Set them as environment variables for the build process
ENV API_KEY=$API_KEY
ENV SUPABASE_URL=$SUPABASE_URL
ENV SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app's source code
COPY . .

# Run the build script. build.mjs will read the ENV variables and inject them.
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:stable-alpine

# Copy the build output from the builder stage. Our script places assets in the 'dist' folder.
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for Nginx
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
