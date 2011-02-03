LIB_DIR = lib
SRC_DIR = src
DIST_DIR = dist
OGE_DIR = ${LIB_DIR}/oge
UNDERSCORE_DIR = ${LIB_DIR}/underscore

BASE_FILES = ${SRC_DIR}/base.js\
			 ${SRC_DIR}/player.js\
			 ${SRC_DIR}/box.js\
			 ${SRC_DIR}/bomb.js\
			 ${SRC_DIR}/fire.js\
			 ${SRC_DIR}/powerup.js\
			 ${SRC_DIR}/game.js
JSLINT4JAVA = ${LIB_DIR}/jslint4java-1.4.6.jar
CLOSURE_COMPILER = ${LIB_DIR}/compiler.jar
BUNDLE_VERSION = ${DIST_DIR}/bomberman.js
BUNDLE_ALL_VERSION = ${DIST_DIR}/bomberman.all.js
MIN_VERSION = ${DIST_DIR}/bomberman.min.js
MIN_ALL_VERSION = ${DIST_DIR}/bomberman.all.min.js

all: update lint build

update: 
	git submodule update --init
	$(call clone_or_pull, ${OGE_DIR}, git@github.com:/eirikb/oge.git)

lint: 
	java -jar ${JSLINT4JAVA} ${BASE_FILES}

build: 
	cat ${UNDERSCORE_DIR}/underscore.js > ${BUNDLE_ALL_VERSION}
	cat ${OGE_DIR}/dist/oge.js > ${BUNDLE_VERSION}
	cat ${OGE_DIR}/dist/oge.js >> ${BUNDLE_ALL_VERSION}
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
