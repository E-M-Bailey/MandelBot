mandelbrot/generate: mandelbrot/generate.cpp
	g++ -lpthread mandelbrot/generate.cpp -o mandelbrot/generate -Ofast

.PHONY: clean-img
clean-img:
	rm -f mandelbrot/img/*

.PHONY: all
all: mandelbrot/generate

.PHONY: clean
clean: clean-img
	rm -f mandelbrot/generate

.PHONY: rebuild
rebuild: clean all
