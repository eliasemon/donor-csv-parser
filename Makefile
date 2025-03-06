.PHONY: run stop restart run-undockerize

run:
	@echo "Starting Docker containers ... with all applications"
	@docker-compose up

run-d:
	@echo "Starting Docker containers... with all applications in detached mode"
	@docker-compose up -d

stop:
	@echo "Stopping Docker containers..."
	@docker-compose down

run-undockerize:
	@echo "Installing dependencies..."
	@npm install
	@echo "Building application..."
	@echo "Starting PostgreSQL container..."
	@docker run -d \
	  --name my_postgres_undockerize \
	  --restart always \
	  -p 5432:5432 \
	  -e POSTGRES_USER=postgres \
	  -e POSTGRES_PASSWORD=mysecretpassword \
	  -e POSTGRES_DB=Donor_Db \
	  -v postgres_data:/var/lib/postgresql/data-undockerize \
	  postgres:latest
	@echo "Starting Inngest CLI and application concurrently..."
	@npx concurrently "npx inngest-cli@latest dev" "npm run start"


stop-undockerize:
	@echo "Stopping PostgreSQL container..."
	@docker stop my_postgres_undockerize || true
	@docker rm my_postgres_undockerize || true
	@echo "Stopping Inngest CLI and application..."
	@taskkill /IM "npx.exe" /F 2> NUL || echo "Inngest CLI might not be running."
	@taskkill /IM "node.exe" /F 2> NUL || echo "Application might not be running."
	@echo "All processes stopped."
