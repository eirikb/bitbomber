LIB_DIR = lib
SHARED_DIR = shared
JASMINE_DIR = ${LIB_DIR}/jasmine
OGE_DIR = ${LIB_DIR}/oge
NODE_STATIC_DIR = ${LIB_DIR}/node-static

BASE_FILES = ${SHARED_DIR}/base.js\
			 ${SHARED_DIR}/player.js\
			 ${SHARED_DIR}/box.js\
			 ${SHARED_DIR}/bomb.js\
			 ${SHARED_DIR}/fire.js\
			 ${SHARED_DIR}/powerup.js\
			 ${SHARED_DIR}/game.js
JSLINT4JAVA = ${LIB_DIR}/jslint4java-1.4.6.jar
CLOSURE_COMPILER = ${LIB_DIR}/compiler.jar
BUNDLE_VERSION = ${SHARED_DIR}/bomberman.js
MIN_VERSION = ${SHARED_DIR}/bomberman.min.js

all: update lint build

lint: 
	java -jar ${JSLINT4JAVA} ${BASE_FILES}

update: 
	$(call clone_or_pull, ${JASMINE_DIR}, https://github.com/pivotal/jasmine.git)
	$(call clone_or_pull, ${OGE_DIR}, https://github.com/eirikb/oge.git)
	$(call clone_or_pull, ${NODE_STATIC_DIR}, https://github.com/cloudhead/node-static.git)

build: 
	cat ${OGE_DIR}/dist/oge.js > ${BUNDLE_VERSION}
	cat ${BASE_FILES} >> ${BUNDLE_VERSION}
	java -jar ${CLOSURE_COMPILER} --js ${BUNDLE_VERSION} --js_output_file ${MIN_VERSION}

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
