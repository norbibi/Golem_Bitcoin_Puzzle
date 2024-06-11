#include <errno.h>
#include <limits.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <errno.h>
#include <sys/random.h>

#define FILENAME_MAX_LENGTH 256
#define TOTAL_CHUNKS		8388608

// chunk_state read [filename] [bit_number]
// chunk_state write [filename] [bit_number] [val]
// chunk_state gen [filename] [chunk_number] [chunk_start]
// chunk_state gen_rand [filename] [chunk_number]

// dd if=/dev/zero of=chunks bs=4k count=2097152
// chmod +w chunks
// gcc -o chunk_state chunk_state.c
// chmod +x chunk_state

int range_handler(char *filename, char op, long int bit_number, char value, bool display) {
	FILE *file_handle;
	long int byte_number;
	char tmp, bit_number_in_byte;
	int val, status = 0;

	byte_number = bit_number / 8;
	bit_number_in_byte = bit_number % 8;

	//printf("byte_number = %ld, bit_number_in_byte = %d\n", byte_number, bit_number_in_byte);

	file_handle = fopen(filename,"r+b");
	if(!file_handle)
	{
		printf("Error, unable to open file %s for reading\n", filename);
		status = -11;
		goto end;
	}

	if(!fseek(file_handle, byte_number, SEEK_SET))
	{
		if(fread(&tmp, 1, 1, file_handle) != 1)
		{
			printf("Error, unable to read byte from file %s\n", filename);
			status = -12;
			goto error_close;
		}

		if(op == 0) {
			status = (int)((tmp >> bit_number_in_byte) & 1);
			if(display)
				printf("%d\n", status);
		}
		else
		{
			if(!file_handle)
			{
				printf("Error, unable to open file %s for writing\n", filename);
				status = -13;
				goto end;
			}

			if(fseek(file_handle, byte_number, SEEK_SET))
			{
				printf("Error, unable to seek/write file %s at byte offset %ld, errno = %d\n", filename, byte_number, errno);
				status = -14;
				goto error_close;
			}

			if(value)
				tmp |= (1 << bit_number_in_byte);
			else
				tmp &= ~(1 << bit_number_in_byte);

			if(fwrite(&tmp, 1, 1, file_handle) != 1)
			{
				printf("Error, unable to write byte to file %s\n", filename);
				status = -15;
				goto error_close;
			}
		}

	}
	else
	{
		printf("Error, unable to seek/read file %s at byte offset %ld\n", filename, byte_number);
		status = -16;
		goto error_close;
	}

error_close:

	fclose(file_handle);

end:
	return status;
}

int generate_chunks(char *filename, long int gen_number,  long int start) {
	int already_tested, status = 0;
	long int number, gen_number_counter = 0;

	number = start;

	do {
		do {
			already_tested = range_handler(filename, 0, number, 0, false);
			if(already_tested) {
				number++;
				if(number >= TOTAL_CHUNKS)
					number = 0;
			}
		} while(already_tested);
		status = range_handler(filename, 1, number, 1, false);
		if(status < 0)
		{
			printf("Error, generate_chunk, number = %ld\n", number);
			return status;
		}
		else {
			printf("%ld ", number);
			number++;
		}
	} while((++gen_number_counter) != gen_number);
	printf("\n");

	return 0;
}

int generate_rand_chunks(char *filename, long int gen_number) {
	int already_tested, status = 0;
	long int random_number, gen_number_counter = 0;

	do {
		do {
			status = getrandom((void *)(&random_number), 5, 0);
			if(status != -1)
			{
				random_number &= 0x7FFFFF;
				already_tested = range_handler(filename, 0, random_number, 0, false);
			}
			else
				return -101;
		} while(already_tested);
		status = range_handler(filename, 1, random_number, 1, false);
		if(status < 0)
		{
			printf("Error, generate_chunk, random_number = %ld\n", random_number);
			return status;
		}
		else
			printf("%ld ", random_number);
	} while((++gen_number_counter) != gen_number);
	printf("\n");

	return 0;
}

int main(int argc, char* argv[]) {
	char filename[FILENAME_MAX_LENGTH+1];
	char operation[8+1];
	long int bit_number, gen_number, start;
	char value, op = 4;
	int status = 0;

	filename[FILENAME_MAX_LENGTH+1] = 0;
	operation[8] = 0;

	if(argc < 3)
	{
		printf("Error, missing setting(s)");
		status -1;
		goto end;
	}

	snprintf(operation, 9, "%s", argv[1]);
	snprintf(filename, FILENAME_MAX_LENGTH, "%s", argv[2]);

	if(!strncmp(operation, "read", 8)) {
		if(argc < 4)
		{
			printf("Error, missing setting(s)");
			status -2;
			goto end;
		}
		else {
			op = 0;
			bit_number = strtol(argv[3], NULL, 10);
			if((bit_number < 0) || (bit_number > (TOTAL_CHUNKS-1))) {
				printf("Error, setting(s) bad value");
				status -4;
				goto end;
			}
		}
	}
	else if(!strncmp(operation, "write", 8))
	{
		if(argc < 5)
		{
			printf("Error, missing setting(s)");
			status -3;
			goto end;
		}
		else {
			op = 1;
			bit_number = strtol(argv[3], NULL, 10);
			value = (char)strtol(argv[4], NULL, 10);
			if((bit_number < 1) || (bit_number > TOTAL_CHUNKS)) {
				printf("Error, setting(s) bad value");
				status -4;
				goto end;
			}
		}
	}
	else if(!strncmp(operation, "gen", 8)) {
		if(argc < 5)
		{
			printf("Error, missing setting(s)");
			status -5;
			goto end;
		}
		else {
			op = 2;
			gen_number = strtol(argv[3], NULL, 10);
			start = strtol(argv[4], NULL, 10);
			if((gen_number < 1) || (gen_number > TOTAL_CHUNKS) || (start < 0) || (start > (TOTAL_CHUNKS-1)))
			{
				printf("Error, setting(s) bad value");
				status -6;
				goto end;
			}
		}
	}
	else if(!strncmp(operation, "gen_rand", 8)) {
		if(argc < 4)
		{
			printf("Error, missing setting(s)");
			status -7;
			goto end;
		}
		else {
			op = 3;
			gen_number = strtol(argv[3], NULL, 10);
			if((gen_number < 1) || (gen_number > TOTAL_CHUNKS))
			{
				printf("Error, setting(s) bad value");
				status -8;
				goto end;
			}
		}
	}
	else
	{
		printf("Error, bad operation, must be read, write, gen or gen_rand\n");
		status = -9;
		goto end;
	}

	if((op == 0) || (op == 1))
		status = range_handler(filename, op, bit_number, value, true);
	else if(op == 2)
		status = generate_chunks(filename, gen_number, start);
	else if(op == 3)
		status = generate_rand_chunks(filename, gen_number);

end:
	return status;
}
