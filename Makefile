run:
	yarn tauri dev

docker-run:
	sudo docker build -t text-editor .
	sudo docker run --name text-editor -dp 3000:80 text-editor