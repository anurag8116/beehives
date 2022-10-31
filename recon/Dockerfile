FROM httpd:alpine3.16
COPY conf/httpd.conf /usr/local/apache2/conf/httpd.conf
COPY conf/htaccess /usr/local/apache2/htdocs/.htaccess
COPY dist/ /usr/local/apache2/htdocs/
