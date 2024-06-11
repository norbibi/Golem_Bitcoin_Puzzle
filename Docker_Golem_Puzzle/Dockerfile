FROM maugnorbert/docker_golem_nvidia:535_43_02

RUN apt-get update && apt-get upgrade -y && apt-get install -y \
	curl \
	ca-certificates \
	gnupg \
	&& rm -rf /var/lib/apt/lists/*

RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_21.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list

RUN apt-get update && apt-get install -y \
	nodejs \
	&& rm -rf /var/lib/apt/lists/*

COPY rc86 /usr/bin/rc86
RUN chmod +x /usr/bin/rc86
COPY rc89 /usr/bin/rc89
RUN chmod +x /usr/bin/rc89
COPY libcudart.so.12 /usr/lib/libcudart.so.12

RUN npm install --prefix /root @metamask/eth-sig-util
COPY encrypt.mjs /root/encrypt.mjs

VOLUME /golem/work
WORKDIR /golem/work