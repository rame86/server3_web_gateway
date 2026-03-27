# /frontend/Dockerfile
# --- [Stage 1] Build Stage ---
FROM node:20-alpine AS builder
WORKDIR /app

# Corepack 활성화 및 pnpm 준비
RUN corepack enable && corepack prepare pnpm@latest --activate

# 루트의 의존성 파일 복사 및 설치
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/
RUN pnpm install --no-frozen-lockfile

# 소스 전체 복사 (client, shared 등 모든 코드 포함)
COPY . .

# 루트 디렉터리에서 빌드 실행 (결과물은 /app/dist에 생성됨)
RUN pnpm run build

# --- [Stage 2] Production Stage ---
FROM nginx:alpine

# 기존 Nginx 기본 설정 제거
RUN rm -rf /usr/share/nginx/html/* \
    && rm /etc/nginx/conf.d/default.conf

# Builder 스테이지에서 생성된 /app/dist 내부의 파일을 Nginx 서빙 폴더로 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# 라우팅을 위한 Nginx 커스텀 설정 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 권한 설정
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 88
CMD ["nginx", "-g", "daemon off;"]