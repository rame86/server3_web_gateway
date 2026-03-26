# /frontend/client/Dockerfile

# --- [Stage 1] Build Stage ---
FROM node:20-alpine AS builder
WORKDIR /app

# Corepack 활성화 및 pnpm 준비
RUN corepack enable && corepack prepare pnpm@latest --activate

# 의존성 설치 (client 폴더 내부 기준)
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/
RUN pnpm install --no-frozen-lockfile

# 소스 전체 복사 후 Vite 빌드
COPY . .
RUN pnpm run build

# --- [Stage 2] Production Stage ---
FROM nginx:alpine

# 기존 설정 제거
RUN rm -rf /usr/share/nginx/html/*
RUN rm /etc/nginx/conf.d/default.conf

# Builder에서 생성된 dist 폴더를 Nginx 경로로 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA 라우팅을 위한 Nginx 설정 파일 복사 (client 폴더 안에 nginx.conf가 있어야 함)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx 실행 권한 부여
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 88
CMD ["nginx", "-g", "daemon off;"]