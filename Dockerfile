# /frontend/Dockerfile
FROM nginx:alpine

# 기존 Nginx 기본 HTML 파일 및 기본 설정 제거
RUN rm -rf /usr/share/nginx/html/*
RUN rm /etc/nginx/conf.d/default.conf

# dist 폴더 내부의 모든 파일을 html 디렉토리로 복사
COPY dist/ /usr/share/nginx/html/

# [수정됨] SPA 라우팅용 커스텀 Nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx가 파일을 정상적으로 읽을 수 있도록 디렉토리 권한 일괄 부여
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]