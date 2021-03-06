sudo yum install -y wget git gcc gcc-c++ zlib1g-devel libssl-devel openssl-devel cmake pcre-devel autoconf automake json-c-devel

# PHP dependencies:
yum install -y php php-common php-json php-dom php-pdo php-intl php-sysvsem

(
wget https://red.libssh.org/attachments/download/177/libssh-0.7.2.tar.xz
tar -xJf libssh-0.7.2.tar.xz
mkdir -p libssh-0.7.2/build
cd libssh-0.7.2/build
cmake -DCMAKE_INSTALL_PREFIX:PATH=/usr -DLIB_INSTALL_DIR=/usr/lib64 .. && make -j2 && sudo make install
)

(
git clone --depth 1 https://github.com/CESNET/libyang.git
mkdir -p libyang/build
cd libyang/build
cmake -DCMAKE_INSTALL_PREFIX=/usr -DLIB_INSTALL_DIR=lib64 -DENABLE_BUILD_TESTS=OFF .. && sudo make install && sudo make install
)

(
wget https://cmocka.org/files/1.0/cmocka-1.0.1.tar.xz
tar -xJf cmocka-1.0.1.tar.xz
mkdir -p cmocka-1.0.1/build
cd cmocka-1.0.1/build
cmake -DCMAKE_INSTALL_PREFIX:PATH=/usr .. && make -j2 && sudo make install
)

(
git clone --depth 1 https://github.com/warmcat/libwebsockets.git lws
mkdir lws/b
cd lws/b
cmake -DCMAKE_INSTALL_PREFIX:PATH=/usr -DLWS_INSTALL_LIB_DIR=/usr/lib -DLIB_SUFFIX=64 .. && sudo make install
)

# libnetconf2
(
git clone --depth 1 https://github.com/CESNET/libnetconf2.git
mkdir -p libnetconf2/build
cd libnetconf2/build
cmake -DENABLE_TLS=ON -DENABLE_SSH=ON -DENABLE_BUILD_TESTS=OFF -DCMAKE_INSTALL_PREFIX=/usr -DLIB_INSTALL_DIR=lib64 .. && sudo make install
)
ldconfig

(
git clone --depth 1 https://github.com/CESNET/netopeerguid
cd netopeerguid
./bootstrap.sh
./configure
make
make install
)

(
cd /var/www/
git clone --depth 1 https://github.com/CESNET/Netopeer-GUI netopeergui
cd netopeergui
cp app/config/parameters.yml.dist app/config/parameters.yml
php app/check.php
php ./composer.phar self-update
php ./composer.phar install
php app/check.php
cd install
./bootstrap.sh && ./configure --without-modnetconf -q && make install
service httpd restart
service netopeerguid restart
cd /var/www/netopeergui 
php app/console app:install --post=install
chcon -R -t httpd_sys_rw_content_t /var/www/netopeergui/app/{cache,logs}
)
