FROM nginx:alpine

COPY . /usr/share/nginx/html

RUN sed -i 's/listen       80;/listen       10000;/g' /etc/nginx/conf.d/default.conf  && mkdir -p /usr/share/nginx/html/assets  && cp /usr/share/nginx/html/sdolars_clean_scene.png /usr/share/nginx/html/assets/sdolars_mobile_scene.png  && sed -i 's#assets/sdolars_mobile_scene.jpg#assets/sdolars_mobile_scene.png#g' /usr/share/nginx/html/index.html

EXPOSE 10000

CMD ["nginx", "-g", "daemon off;"]
