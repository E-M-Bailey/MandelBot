//#include <array>
#include <math.h>
#include <stdint.h>
#include <string.h>

typedef uint32_t color_t;

namespace imgutil
{
	template<typename T>
	inline constexpr T clamp(T x, T lo, T hi)
	{
		return x <= lo ? lo : x >= hi ? hi : x;
	}

	// hue is modded into [0, 1]. Others are expected to be in that range already.
	color_t hsvaToHex(double h, double s, double v, double a)
	{
		h = fmod(fmod(h, 1.) + 1., 1.);
		double c = v * s;
		double x = c * (1 - abs(fmod(h * 6, 2.) - 1));
		double m = v - c;
		double r, g, b;
		switch (static_cast<unsigned>(h * 6))
		{
			case 0:
				r = c;
				g = x;
				b = 0;
				break;
			case 1:
				r = x;
				g = c;
				b = 0;
				break;
			case 2:
				r = 0;
				g = c;
				b = x;
				break;
			case 3:
				r = 0;
				g = x;
				b = c;
				break;
			case 4:
				r = x;
				g = 0;
				b = c;
				break;
			case 5:
				r = c;
				g = 0;
				b = x;
				break;
		}

		color_t rInt = clamp(static_cast<unsigned>((r + m) * 255), 0u, 255u);
		color_t gInt = clamp(static_cast<unsigned>((g + m) * 255), 0u, 255u);
		color_t bInt = clamp(static_cast<unsigned>((b + m) * 255), 0u, 255u);
		color_t aInt = clamp(static_cast<unsigned>(a * 255), 0u, 255u);

		//return {rInt, gInt, bInt, aInt};
		return (rInt << 24u) | (gInt << 16u) | (bInt << 8u) | aInt;
	}

	
}