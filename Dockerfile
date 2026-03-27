# --- [Stage 1] Build Stage ---
FROM node:20-alpine AS builder
WORKDIR /app

# lock 파일을 포함해야 설치 속도와 일관성이 유지됩니다.
COPY package.json package-lock.json* ./

# npm ci는 lock 파일을 기준으로 훨씬 빠르게 설치합니다.
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline

# 소스 복사는 가장 마지막에 (소스가 변해도 위 레이어는 캐싱됨)
COPY . .
RUN npm run build

# --- [Stage 2] Production Stage ---
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/* && \
    rm /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 포트 일치 (88을 쓰고 싶다면 여기서도 88로 명시하거나 nginx.conf 확인)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]