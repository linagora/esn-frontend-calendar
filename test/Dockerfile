FROM node:10-buster

RUN wget http://download-installer.cdn.mozilla.net/pub/firefox/releases/81.0/linux-x86_64/en-GB/firefox-81.0.tar.bz2
RUN tar xjf firefox-81.0.tar.bz2
RUN mv firefox /usr/local
RUN chown -R root:root /usr/local/firefox
RUN cd /usr/local/bin
RUN ln -s ../firefox/firefox .

ENV MOZ_FORCE_DISABLE_E10S=true
