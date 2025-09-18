
YARN=yarn
all:
	test
test:
	$(YARN) vscode:prepublish
compile:
	$(YARN) compile
lint:
	$(YARN) lint
unittest:
	$(YARN) unittest


