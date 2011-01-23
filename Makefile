LIB_DIR = lib
NODE_STATIC_DIR = ${LIB_DIR}/node-static
SOCKET_IO_DIR = ${LIB_DIR}/socket.io
UNDERSCORE_DIR = ${LIB_DIR}/underscore
BOMBERMAN_CLIENT_DIR = ${LIB_DIR}/bomberman-client

all: update hack

update: 
	$(call clone_or_pull, ${NODE_STATIC_DIR}, https://github.com/cloudhead/node-static.git)
	$(call clone_or_pull, ${SOCKET_IO_DIR}, https://github.com/LearnBoost/Socket.IO-node.git)
	$(call clone_or_pull, ${BOMBERMAN_CLIENT_DIR}, https://github.com/eirikb/bomberman-client.git)
	$(call clone_or_pull, ${UNDERSCORE_DIR}, https://github.com/documentcloud/underscore.git)

hack:
	cd ${BOMBERMAN_CLIENT_DIR};make update
	cp ${BOMBERMAN_CLIENT_DIR}/lib/qunit/qunit/qunit.js ${BOMBERMAN_CLIENT_DIR}/public/js/
	cp ${BOMBERMAN_CLIENT_DIR}/lib/qunit/qunit/qunit.css ${BOMBERMAN_CLIENT_DIR}/public/css/
	cp ${BOMBERMAN_CLIENT_DIR}/lib/oge/dist/oge.js ${BOMBERMAN_CLIENT_DIR}/public/js/
	cp ${BOMBERMAN_CLIENT_DIR}/lib/underscore/underscore.js ${BOMBERMAN_CLIENT_DIR}/public/js/

define clone_or_pull
-@@if test ! -d $(strip ${1})/.git; then \
	echo "Cloning $(strip ${1})..."; \
	git clone $(strip ${verbose}) --depth=1 $(strip ${2}) $(strip ${1}); \
	else \
	echo "Pulling $(strip ${1})..."; \
	git --git-dir=$(strip ${1})/.git pull $(strip ${verbose}) origin master; \
	fi

endef

.PHONY: all update
