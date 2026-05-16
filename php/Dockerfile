FROM php:8.2-apache

RUN apt-get update && apt-get install -y libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql \
    && a2enmod rewrite headers

COPY . /var/www/html/

RUN mv /var/www/html/init.sql /init.sql \
    && echo '<?php echo "PHP_WORKS";' > /var/www/html/test.php

RUN echo 'ServerName localhost' >> /etc/apache2/apache2.conf \
    && echo '<FilesMatch "\.php$">\n    SetHandler application/x-httpd-php\n</FilesMatch>' > /etc/apache2/mods-available/php.conf \
    && ln -sf /etc/apache2/mods-available/php.conf /etc/apache2/mods-enabled/php.conf

RUN echo '<VirtualHost *:80>\n\
    DocumentRoot /var/www/html\n\
    <Directory /var/www/html>\n\
        Options -Indexes\n\
        AllowOverride All\n\
        Require all granted\n\
        <FilesMatch "\.php$">\n\
            SetHandler application/x-httpd-php\n\
        </FilesMatch>\n\
    </Directory>\n\
    Header always set Access-Control-Allow-Origin "http://localhost:3000"\n\
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, PATCH, OPTIONS"\n\
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization"\n\
    RewriteEngine On\n\
    RewriteCond %{REQUEST_FILENAME} !-f\n\
    RewriteCond %{REQUEST_FILENAME} !-d\n\
    RewriteRule ^ /index.php [L]\n\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf

EXPOSE 80