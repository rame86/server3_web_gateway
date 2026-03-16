# /web /Dockerfile
FROM nginx:alpine

# CI/CD에서 전송한 dist 폴더 복사
COPY dist /usr/share/nginx/html

# React SPA 라우팅을 위한 설정 덮어쓰기
RUN rm /etc/nginx/conf.d/default.conf && \
    echo "server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files \$uri \$uri/ /index.html; } }" > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]