LIB_DIR = lib
BLASTINGBOB_CLIENT_DIR = ${LIB_DIR}/blastingbob-client

all: update hack

update:
	git submodule update --init
	$(call clone_or_pull, ${BLASTINGBOB_CLIENT_DIR}, git@github.com:/eirikb/blastingbob-client.git)
	$(call clone_or_pull, lib/blastingbob-game, git@github.com:/eirikb/blastingbob-game.git)

hack:
	cd public; \
		ln -sf ../${BLASTINGBOB_CLIENT_DIR}/public/* ./; \
		ln -sf ../${BLASTINGBOB_CLIENT_DIR}/dist/blastingbob.all.min.js ./;

dev:
	cd public; \
		ln -sf ../${BLASTIGBOB_CLIENT_DIR}/public/images ./; \
		ln -sf ../${BLASTINBOB_CLIENT_DIR}/public/blastingbob.css ./; \
		ln -sf ../${BLASTINGBOB_CLIENT_DIR}/src/* ./; \
		ln -sf ../lib/blastingbob-game/dist/blastingbob.all.js ./

define clone_or_pull
-@@if test ! -d $(strip ${1})/.git; then \
	echo "Cloning $(strip ${1})..."; \
	git clone $(strip ${verbose}) --depth=1 $(strip ${2}) $(strip ${1}); \
	else \
	echo "Pulling $(strip ${1})..."; \
	git --git-dir=$(strip ${1})/.git pull $(strip ${verbose}) origin master; \
	fi

endef
