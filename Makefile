run: test
	yarn
	yarn tauri dev

test:
	yarn
	yarn test

docker-build:
	docker build -t text-editor .

docker-run:
	docker run --name text-editor -dp 3000:80 text-editor

docker-down:
	-docker stop text-editor
	-docker rm text-editor

dockerize: test docker-build docker-down docker-run
