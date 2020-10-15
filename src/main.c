#include <string.h>
#include <stdio.h>
#include "login.h"

// gcc -include params/ultra.h -DARGON2_NO_THREADS main.c login.c phc-winner-argon2/src/argon2.c phc-winner-argon2/src/core.c phc-winner-argon2/src/blake2/blake2b.c phc-winner-argon2/src/encoding.c phc-winner-argon2/src/opt.c -O3 -o login  -march=native
// gcc -include params/ultra.h -DARGON2_NO_THREADS main.c login.c phc-winner-argon2/src/argon2.c phc-winner-argon2/src/core.c phc-winner-argon2/src/blake2/blake2b.c phc-winner-argon2/src/encoding.c phc-winner-argon2/src/ref.c -O3 -o login
int main(int argc, char**argv) {
  if(argc != 4) {
    printf("Usage: %s domain identifier password\n",argv[0]);
    return 1;
  }
  uint8_t key[HASHLEN];
  if (!hash_password(strlen(argv[1]), argv[1], strlen(argv[2]), argv[2], strlen(argv[3]), argv[3], key)) {
    fprintf(stderr,"Error performing hash\n");
    return 1;
  }
  for (size_t i = 0; i < sizeof(key); i++)
    printf("%02x",key[i]);
  printf("\n");
}
