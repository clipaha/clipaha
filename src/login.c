#include <stdint.h>
#include <string.h>
#include <stdlib.h>
#include <stdbool.h>
#include <alloca.h>
#include "argon2.h"
#ifdef JS_CODE
#include <emscripten.h>
/*//TODO: this requires IE11 or higher xD
EM_JS(void, getrandom, (uint8_t * buf, size_t buflen, unsigned int flags), {
  var a = new Uint8Array(buflen);
  window.crypto.getRandomValues(a);
  writeArrayToMemory(a,buf);
  return buflen;
});*/
#else
/*#include <sys/random.h>*/
#define EMSCRIPTEN_KEEPALIVE
#endif

#include "login.h"

#ifndef CLIPAHA_HASH_MEM
#warning "Defaulting hash mem"
#define CLIPAHA_HASH_MEM ((2<<20)-(32<<10))
#endif

#ifndef CLIPAHA_HASH_ITS
#warning "Defaulting hash its"
#define CLIPAHA_HASH_ITS 3
#endif

static inline uint8_t  * copy_uint32_t (uint8_t dst[sizeof(uint32_t)], uint32_t u32) {
  for (uint32_t i = 0 ; i < sizeof(uint32_t); i++) {
    dst[i] = (u32>>(i*8)) & 0xff;
  }
  return dst+sizeof(uint32_t);
}

static inline uint8_t  * copy_uint8_tp (uint8_t *dst, uint32_t u8p_len, const uint8_t *u8p) {
  memcpy(dst, u8p, u8p_len);
  return dst+u8p_len;
}

#define ARGON2_BLOCK_SIZE 1024
#ifdef JS_CODE
// #include <unistd.h>
// 
// // Needed for -s MALLOC=none which doesn't work yet
// //void * malloc(size_t size) { return NULL; }
// //void free(void *ptr) { return; }
// 
// void *argon2_mem = NULL;
// bool allocated = false;
// 
// //HACK: purposefully not reentrant nor thread safe
// static int allocate_argon2_mem (uint8_t **memory, size_t bytes_to_allocate) {
//   if (!allocated && bytes_to_allocate == CLIPAHA_HASH_MEM * ARGON2_BLOCK_SIZE) {
//     allocated = true;
//     *memory = argon2_mem;
//     return ARGON2_OK;
//   } else {
//     *memory = NULL;
//     return ARGON2_MEMORY_ALLOCATION_ERROR;
//   }
// }
// 
// void deallocate_argon2_mem (uint8_t *memory, size_t bytes_to_allocate) {
//   if (bytes_to_allocate == CLIPAHA_HASH_MEM * ARGON2_BLOCK_SIZE)
//     allocated = false;
// }
#define allocate_argon2_mem NULL
#define deallocate_argon2_mem NULL
#else
#ifdef __linux__
#include <sys/mman.h>

static int allocate_argon2_mem (uint8_t **memory, size_t bytes_to_allocate) {
  int flags = MAP_PRIVATE|MAP_ANONYMOUS;
  int hugetlb_type = 0;
  int hugetlb = 0;
  if (bytes_to_allocate != CLIPAHA_HASH_MEM * ARGON2_BLOCK_SIZE) {
    *memory = malloc(bytes_to_allocate);
    return *memory != NULL ? ARGON2_OK : ARGON2_MEMORY_ALLOCATION_ERROR;
  }
  if (bytes_to_allocate > 1*1024*1024*1024) {
    hugetlb_type = MAP_HUGETLB|(30 << MAP_HUGE_SHIFT);
    hugetlb = MAP_HUGETLB;
  } else if (bytes_to_allocate > 2*1024*1024) {
    hugetlb_type = MAP_HUGETLB|(21 << MAP_HUGE_SHIFT);
    hugetlb = MAP_HUGETLB;
  } else {
    hugetlb_type = 0;
    hugetlb = 0;
  }
  *memory = mmap(NULL, bytes_to_allocate, PROT_READ|PROT_WRITE, flags|hugetlb_type, -1, 0);
  if (hugetlb_type && *memory == MAP_FAILED) {
    //Retry without memory size hint
    *memory = mmap(NULL, bytes_to_allocate, PROT_READ|PROT_WRITE, flags|hugetlb, -1, 0);
  }
  if (hugetlb && *memory == MAP_FAILED) {
    //Retry without huge_tlb too
    *memory = mmap(NULL, bytes_to_allocate, PROT_READ|PROT_WRITE, flags, -1, 0);
  }
  if (*memory == MAP_FAILED) {
    *memory = NULL;
    return ARGON2_MEMORY_ALLOCATION_ERROR;
  } else {
    madvise(*memory,bytes_to_allocate,MADV_RANDOM);
    return ARGON2_OK;
  }
}

void deallocate_argon2_mem (uint8_t *memory, size_t bytes_to_allocate) {
  if (memory != NULL)
    munmap(memory, bytes_to_allocate);
}

#else
#define allocate_argon2_mem NULL
#define deallocate_argon2_mem NULL
#endif
#endif

EMSCRIPTEN_KEEPALIVE int hash_password(uint32_t d_len, const uint8_t *d, uint32_t i_len, const uint8_t *i, const uint32_t password_len, const uint8_t *password, uint8_t key[HASHLEN]) {
  argon2_context ctx;
#ifdef JS_CODE
// This doesn't provide significant advantadges but may help avoid fragmentation and overhead from malloc, test in depth later.
//   if (!argon2_mem) {
//     argon2_mem = sbrk(CLIPAHA_HASH_MEM * ARGON2_BLOCK_SIZE);
//   }
//     argon2_mem = alloca(CLIPAHA_HASH_MEM * ARGON2_BLOCK_SIZE);
#endif
  ctx.out = key;
  ctx.outlen = HASHLEN;
  ctx.pwd = (uint8_t *)password;
  ctx.pwdlen = password_len;
  ctx.saltlen = sizeof(uint32_t)*2+sizeof(uint8_t)*(d_len+i_len);
  ctx.salt = alloca(ctx.saltlen);
  {
    uint8_t *tsalt = ctx.salt;
    tsalt = copy_uint32_t(tsalt,d_len);
    tsalt = copy_uint8_tp(tsalt,d_len,d);
    tsalt = copy_uint32_t(tsalt,i_len);
    tsalt = copy_uint8_tp(tsalt,i_len,i);
  }
  ctx.secretlen = 0;
  ctx.secret = NULL;
  ctx.adlen = 0;
  ctx.ad = NULL;
  ctx.t_cost = CLIPAHA_HASH_ITS;
  ctx.m_cost = CLIPAHA_HASH_MEM;
  ctx.lanes = 256;
  ctx.threads = 1; //TODO: maybe change if pthreads allowed
  ctx.allocate_cbk = allocate_argon2_mem;
  ctx.free_cbk = deallocate_argon2_mem;
  ctx.flags = ARGON2_DEFAULT_FLAGS;
  ctx.version = ARGON2_VERSION_13;
  return argon2_ctx(&ctx, Argon2_id) == ARGON2_OK;
}
