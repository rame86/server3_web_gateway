# Stage 1: Build stage
FROM node:22-alpine AS build-stage

# pnpm 설치
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

WORKDIR /app

# 의존성 파일 먼저 복사 (캐싱 최적화)
COPY package.json pnpm-lock.yaml* ./

# 의존성 설치 (CI 환경과 동일하게)
RUN pnpm install --frozen-lockfile

# 전체 소스 복사 및 빌드
COPY . .
RUN pnpm run build

# Stage 2: Production stage
FROM openresty/openresty:alpine-fat

# 빌드 결과물(dist)을 OpenResty 정적 파일 경로로 복사
COPY --from=build-stage /app/dist /usr/local/openresty/nginx/html

# Nginx 설정 파일 복사 (필요 시)
# COPY default.conf /etc/nginx/conf.d/default.conf
# COPY auth.lua /usr/local/openresty/lualib/auth.lua

EXPOSE 80

CMD ["openresty", "-g", "daemon off;"]