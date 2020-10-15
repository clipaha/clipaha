#ifndef LOGIN_H
#define LOGIN_H
#include <stdint.h>

#define HASHLEN 32

int hash_password(uint32_t d_len, const uint8_t *d, uint32_t i_len, const uint8_t *i, const uint32_t password_len, const uint8_t *password, uint8_t key[HASHLEN]);
#endif
