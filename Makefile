LIB_DIR = lib
SRC_DIR = src
DIST_DIR = dist
BOMBERMAN_GAME_DIR = ${LIB_DIR}/bomberman-game
QUNIT_DIR = ${LIB_DIR}/qunit

BASE_FILES = ${SRC_DIR}/client.js\
			 ${SRC_DIR}/gameclient.js\
			 ${SRC_DIR}/lobbyclient.js
JSLINT4JAVA = ${LIB_DIR}/jslint4java-1.4.6.jar
CLOSURE_COMPILER = ${LIB_DIR}/compiler.jar
BUNDLE_VERSION = ${DIST_DIR}/bomberman.js
BUNDLE_ALL_VERSION = ${DIST_DIR}/bomberman.all.js
MIN_VERSION = ${DIST_DIR}/bomberman.min.js
MIN_ALL_VERSION = ${DIST_DIR}/bomberman.all.min.js

all: update lint build

lint: 
	java -jar ${JSLINT4JAVA} ${BASE_FILES}

update: 
	$(call clone_or_pull, ${BOMBERMAN_GAME_DIR}, https://github.com/eirikb/bomberman-game.git)
	$(call clone_or_pull, ${QUNIT_DIR}, https://github.com/jquery/qunit.git)

build: 
	cat ${BOMBERMAN_GAME_DIR}/dist/bomberman.js > ${BUNDLE_VERSION}
	cat ${BOMBERMAN_GAME_DIR}/dist/bomberman.all.js > ${BUNDLE_ALL_VERSION}
	cat ${BASE_FILES} >> ${BUNDLE_ALL_VERSION}
	cat ${BASE_FILES} >> ${BUNDLE_VERSION}
	java -jar ${CLOSURE_COMPILER} --js ${BUNDLE_VERSION} --js_output_file ${MIN_VERSION}
	java -jar ${CLOSURE_COMPILER} --js ${BUNDLE_ALL_VERSION} --js_output_file ${MIN_ALL_VERSION}

define clone_or_pull
-@@if test ! -d $(strip ${1})/.git; then \
	echo "Cloning $(strip ${1})..."; \
	git clone $(strip ${verbose}) --depth=1 $(strip ${2}) $(strip ${1}); \
	else \
	echo "Pulling $(strip ${1})..."; \
	git --git-dir=$(strip ${1})/.git pull $(strip ${verbose}) origin master; \
	fi

endef

.PHONY: all update lint
