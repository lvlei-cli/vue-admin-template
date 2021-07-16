FROM  nginx:1.16
ADD ./dist /data/project/dealer
ADD nginx.conf /etc/nginx
