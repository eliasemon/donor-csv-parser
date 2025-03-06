.PHONY: run stop restart

run:
	@echo "Starting Docker containers ... with all applications"
	@docker-compose up

run-d:
	@echo "Starting Docker containers... with all applications in detached mode"
	@docker-compose up -d

stop:
	@echo "Stopping Docker containers..."
	@docker-compose down

restart: stop run
