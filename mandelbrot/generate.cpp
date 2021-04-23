#include <algorithm>
#include <atomic>
#include <arpa/inet.h>
#include <iostream>
#include <math.h>
#include <mutex>
#include <pthread.h>
#include <stdio.h>
#include <string>
#include <vector>

#include "../imgutil.h"

constexpr int NUMTHREADS = 16;

std::mutex coutMutex;
constexpr bool USE_COUT_MUTEX = true;
inline void lockCout()
{
	if (USE_COUT_MUTEX)
		coutMutex.lock();
}
inline void unlockCout() {
	if (USE_COUT_MUTEX)
		coutMutex.unlock();
}

struct Args
{
	double r;
	double i;
	double z;
	int t;
	double d;
	int w;
	int h;
};

void generate(std::string fname, const Args& args);

void compute(color_t* buf, const Args& args);

void* threadJob(void* args);

inline bool inMainBulb(double cr, double ci);

inline bool inMainDisc(double cr, double ci);

int main(int argc, char* argv[])
{
	std::cout << "log generating" << std::endl;

	unsigned int idx = 0;

	char* filename = argv[++idx];
	std::string fname = filename;
	fname += ".bin";

	Args args;
	args.r = atof(argv[++idx]);
	args.i = atof(argv[++idx]);
	args.z = atof(argv[++idx]);
	args.t = atoi(argv[++idx]);
	args.d = atof(argv[++idx]);
	args.w = atoi(argv[++idx]);
	args.h = atoi(argv[++idx]);
	generate(fname, args);

	std::cout << "log done" << std::endl;
	std::cout << "done " << fname << std::endl;
}

const color_t BLACK = 0x000000FF;
const double LOG2 = log(2);
constexpr bool LOG_ROWS = true;

void generate(std::string fname, const Args& args)
{
	color_t* buf = new color_t[args.w * args.h];
	compute(buf, args);

	FILE* bin = fopen(fname.c_str(), "wb");
	fwrite(buf, 4, args.w * args.h, bin);
	fclose(bin);

	delete[] buf;
}

struct ThreadArgs
{
	color_t* buf;
	Args args;
	int index;
	volatile int* globalY;
	std::mutex* yMutex;
};

void compute(color_t* buf, const Args& args)
{
	int threadCt = std::min(NUMTHREADS, args.h);
	std::vector<ThreadArgs> threadArgs(threadCt);
	std::vector<pthread_t> threads(threadCt);

	volatile int globalY = 0;
	std::mutex yMutex;
	
	for (int i = 0; i < threadCt; i++)
	{
		threadArgs[i].buf = buf;
		threadArgs[i].args = args;
		threadArgs[i].index = i;
		threadArgs[i].globalY = &globalY;
		threadArgs[i].yMutex = &yMutex;

		pthread_create(&threads[i], nullptr, threadJob, (void*)&threadArgs[i]);
	}

	for (int i = 0; i < threadCt; i++)
	{
		pthread_join(threads[i], nullptr);
		//lockCout();
		//std::cout << "log 'done with thread " << i << "'" << std::endl;
		//unlockCout();
	}
	return;
}

inline int syncGetRow(int h, volatile int* globalY, std::mutex* yMutex)
{
	yMutex->lock();
	int y = (*globalY)++;
	if (LOG_ROWS && y <= h && y * 100 / h > (y - 1) * 100 / h)
	{
		lockCout();
		std::cout << "prg " << y * 100 / h << std::endl;
		unlockCout();
	}
	yMutex->unlock();
	return y;
}

void* threadJob(void* vArgs)
{
	ThreadArgs* tArgs = (ThreadArgs*)vArgs;
	color_t* buf = tArgs->buf;
	Args* args = &(tArgs->args);
	int tIndex = tArgs->index;
	volatile int* globalY = tArgs->globalY;
	std::mutex* yMutex  = tArgs->yMutex;
	double r = args->r;
	double i = args->i;
	double z = args->z;
	double d = args->d;
	int w = args->w;
	int h = args->h;
	int t = args->t;

	color_t* ptr;
	double ss = sqrt(w * h);
	double d2 = d * d;
	double incr = 1 / (z * ss);
	double hw = w / 2.0;
	double hh = h / 2.0;
	double defCR = r - hw * incr;
	double cr = defCR;
	double defCI = i + hh * incr;
	double ci;
	double compT = 0;
	double zr = 0;
	double zi = 0;
	double zr2 = 0;
	double zi2 = 0;
	double mod2;
	double diverges;
	int y;
	while ((y = syncGetRow(h, globalY, yMutex)) < h)
	{
		ptr = buf + y * w;
		ci = defCI - y * incr;
		for (int x = 0; x < w; x++)
		{
			if (inMainDisc(cr, ci) || inMainBulb(cr, ci))
			{
				diverges = false;
			}
			else
			{
				while (true)
				{
					zi *= zr;
					zi += zi + ci;
					zr = zr2 - zi2 + cr;
					zr2 = zr * zr;
					zi2 = zi * zi;
					compT++;
					mod2 = zr2 + zi2;
					if (mod2 >= d2)
					{
						diverges = true;
						break;
					}
					if (compT > t)
					{
						diverges = false;
						break;
					}
				}
			}
			if (diverges)
			{
				zi *= zr;
				zi += zi + ci;
				zr = zr2 - zi2 + cr;
				zr2 = zr * zr;
				zi2 = zi * zi;
				zi += zi + ci;
				zr = zr2 - zi2 + cr;
				zr2 = zr * zr;
				zi2 = zi * zi;
				compT += 2;
				mod2 = zr2 + zi2;
				double mu = compT - log(log(mod2)) / LOG2 + 1;
				*ptr = htonl(imgutil::hsvaToHex(mu / 36, 1, 1, 1));
			}
			else
			{
				*ptr = htonl(BLACK);
			}
			ptr++;
			compT = 0;
			cr += incr;
			zr = 0;
			zr2 = 0;
			zi = 0;
			zi2 = 0;
		}
		cr = defCR;
	}
	pthread_exit(nullptr);
}

inline bool inMainBulb(double cr, double ci)
{
	double cr2 = cr * cr;
	double ci2 = ci * ci;
	double cm2 = cr2 + ci2;
	double cm = sqrt(cm2);
	double cmInv = 1 / cm;
	double ur = cr * cmInv;
	double ui = ci * cmInv;
	double hui = ci * 0.5;
	double br = ur * 0.5 + hui * ui - 0.25;
	double bi = hui - ur * hui;
	if (cm2 <= br * br + bi * bi)
	{
		return true;
	}
	double icr = cr + 1;
	return icr * icr + ci * ci <= 0.0625;
}

inline bool inMainDisc(double cr, double ci)
{
	cr += 1;
	ci *= ci;
	cr *= cr;
	return cr + ci <= 0.0625;
}
