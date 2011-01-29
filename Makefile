LIB_DIR = lib
BOMBERMAN_CLIENT_DIR = ${LIB_DIR}/bomberman-client

all: update hack

update:
	git submodule update --init

hack:
	cd public; \
		ln -s ../${BOMBERMAN_CLIENT_DIR}/public/* ./; \
		ln -s ../${BOMBERMAN_CLIENT_DIR}/dist/bomberman.all.min.js ./;
