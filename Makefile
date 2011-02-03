LIB_DIR = lib
BOMBERMAN_CLIENT_DIR = ${LIB_DIR}/bomberman-client

all: update hack

update:
	git submodule update --init
	$(call clone_or_pull, ${BOMBERMAN_CLIENT_DIR}, git@github.com:/eirikb/bomberman-client.git)
	$(call clone_or_pull, lib/bomberman-game, git@github.com:/eirikb/bomberman-game.git)

hack:
	cd public; \
		ln -sf ../${BOMBERMAN_CLIENT_DIR}/public/* ./; \
		ln -sf ../${BOMBERMAN_CLIENT_DIR}/dist/bomberman.all.min.js ./;

dev:
	cd public; \
		ln -sf ../${BOMBERMAN_CLIENT_DIR}/public/images ./; \
		ln -sf ../${BOMBERMAN_CLIENT_DIR}/public/bomberman.css ./; \
		ln -sf ../${BOMBERMAN_CLIENT_DIR}/src/* ./; \
		ln -sf ../lib/bomberman-game/dist/bomberman.all.js ./

define clone_or_pull
-@@if test ! -d $(strip ${1})/.git; then \
	echo "Cloning $(strip ${1})..."; \
	git clone $(strip ${verbose}) --depth=1 $(strip ${2}) $(strip ${1}); \
	else \
	echo "Pulling $(strip ${1})..."; \
	git --git-dir=$(strip ${1})/.git pull $(strip ${verbose}) origin master; \
	fi

endef
