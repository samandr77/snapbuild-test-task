# Короткие команды проекта. Требуется Node.js 18+.

.PHONY: help install dev build preview test clean

help:                    ## Список команд
	@grep -E '^[a-z-]+:.*##' $(MAKEFILE_LIST) | sed 's/:.*## /\t— /'

node_modules: package.json
	npm install
	@touch node_modules

install: node_modules    ## Установить зависимости

dev: node_modules        ## Дев-сервер: http://localhost:5173/snapbuild-test-task/
	npm run dev

build: node_modules      ## Сборка в dist/
	npm run build

preview: build           ## Просмотр сборки: http://localhost:4173/snapbuild-test-task/
	npm run preview

test: node_modules       ## Браузерные тесты интерфейса (нужен Chrome)
	npm test

clean:                   ## Удалить dist и node_modules
	rm -rf dist node_modules
