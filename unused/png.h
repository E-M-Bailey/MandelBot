#include <iomanip>

namespace png {

	// CRC stuff is based on the implementation found here:
	// http://www.libpng.org/pub/png/spec/1.2/PNG-CRCAppendix.html

	unsigned int crcTable[256];
	bool crcDone = false;

	inline constexpr void mkCRCTable() {
		for (int n = 0; n < 256; n++) {
			uint32_t c = n;
			for (int k = 0; k < 8; k++) {
				if (c & 1)
						c = 0xedb88320L ^ (c >> 1);
				else
						c = c >> 1;
			}
			crcTable[n] = c;
		}
		crcDone = true;
	}

	inline unsigned int updateCRC(uint32_t crc, unsigned char* buf, int len) {
		uint32_t c = crc;
		if (!crcDone) {
			mkCRCTable();
		}
		for (int n = 0; n < len; n++) {
			c = crcTable[(c ^ buf[n]) & 0xFFu] ^ (c >> 8u);
		}
		return c;
	}

	inline uint32_t getCRC(unsigned char* buf, int len) {
		return ~updateCRC(0xFFFFFFFFu, buf, len);
	}

	inline constexpr void set(unsigned char* ptr, color_t val) {
		ptr[0] = val >> 24;
		ptr[1] = (val >> 16) & 0xFFu;
		ptr[2] = (val >> 8) & 0xFFu;
		ptr[3] = val & 0xFFu;
	}

	unsigned char* mkBuffer(int w, int h) {
		unsigned int len = h + w * h * 4;
		unsigned char* buf = (unsigned char*)malloc(57 + len);
		buf[0] = 137;
		buf[1] = 80;
		buf[2] = 78;
		buf[3] = 71;
		buf[4] = 13;
		buf[5] = 10;
		buf[6] = 26;
		buf[7] = 10;
		buf[8] = 0;
		buf[9] = 0;
		buf[10] = 0;
		buf[11] = 13;
		buf[12] = 'I';
		buf[13] = 'H';
		buf[14] = 'D';
		buf[15] = 'R';
		buf[16] = 0;
		buf[17] = 0;
		buf[18] = 0;
		buf[19] = 0;
		buf[20] = 0;
		buf[21] = 0;
		buf[22] = 0;
		buf[23] = 0;
		buf[24] = 8;
		buf[25] = 6;
		buf[26] = 0;
		buf[27] = 0;
		buf[28] = 0;
		buf[29] = 0;
		buf[30] = 0;
		buf[31] = 0;
		buf[32] = 0;
		buf[33] = 0;
		buf[34] = 0;
		buf[35] = 0;
		buf[36] = 0;
		buf[37] = 'I';
		buf[38] = 'D';
		buf[39] = 'A';
		buf[40] = 'T';
		buf[41 + len] = 0;
		buf[42 + len] = 0;
		buf[43 + len] = 0;
		buf[44 + len] = 0;
		buf[45 + len] = 0;
		buf[46 + len] = 0;
		buf[47 + len] = 0;
		buf[48 + len] = 0;
		buf[49 + len] = 'I';
		buf[50 + len] = 'E';
		buf[51 + len] = 'N';
		buf[52 + len] = 'D';
		buf[53 + len] = 0;
		buf[54 + len] = 0;
		buf[55 + len] = 0;
		buf[56 + len] = 0;

		memset(buf + 41, 0, len);
		set(buf + 16, w);
		set(buf + 20, h);
		set(buf + 29, getCRC(buf + 12, 17));
		set(buf + 33, len);
		set(buf + 53 + len, getCRC(buf + 49, 4));
		return buf;
	}

	void mkPNG(char* filename, int w, int h, unsigned char* buf) {
		std::cout << "log 'filename: " << filename << "'" << std::endl;

		uint32_t len = h + w * h * 4;
		std::cout << "log " << len << " ";
		set(buf + 41 + len, getCRC(buf + 37, 4 + len));
		for (int i = 0; i < 4 + len; i++) {
			unsigned int c = buf[37 + i];
			if (c < 16)
				std::cout << '0';
			std::cout << std::hex << c;
		}
		std::cout << " ";
		std::cout << "CRC=0x" << std::hex << getCRC(buf + 37, 4 + len) << std::endl;
		FILE* png = fopen(filename, "wb");
		fwrite(buf, 1, len + 57, png);
		//fwrite(magic, 1, 8, png);
		//fwrite(IHDR, 1, 25, png);
		//fwrite(IDAT1, 1, 8, png);
		//fwrite((unsigned char*)buf, 1, w * h * 4, png);
		//fwrite(IDAT2, 1, 4, png);
		//fwrite(IEND, 1, 12, png);
		fclose(png);
		free(buf);
	}
}