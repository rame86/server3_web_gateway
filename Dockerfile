# /frontend/Dockerfile
FROM nginx:alpine

# 기존 Nginx 기본 HTML 파일 제거
RUN rm -rf /usr/share/nginx/html/*

# dist 폴더 '내부'의 모든 파일을 html 디렉토리로 복사 (슬래시/ 주의)
COPY dist/ /usr/share/nginx/html/

# Nginx가 파일을 정상적으로 읽을 수 있도록 디렉토리 권한 일괄 부여
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]