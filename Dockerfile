# /frontend/Dockerfile
FROM nginx:alpine

# [설정] 기존 Nginx 기본 HTML 파일 제거
RUN rm -rf /usr/share/nginx/html/*

# [배포] CI/CD로 생성된 dist 폴더의 모든 파일을 Nginx 웹 루트로 복사
COPY dist /usr/share/nginx/html

EXPOSE 80

# Nginx 백그라운드 실행 방지
CMD ["nginx", "-g", "daemon off;"]