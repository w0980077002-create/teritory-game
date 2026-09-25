FROM nginx:alpine

# Territory Game — mobile WebApp runtime
# Static files are copied exactly as committed; nginx.conf controls caching/routing.
COPY . /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 10000
CMD ["nginx", "-g", "daemon off;"]
