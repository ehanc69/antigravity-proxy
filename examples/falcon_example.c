#include <stdio.h>
#include "api.h"  // PQClean Falcon-512 (level 1)

#define FALCON512_PUBLICKEYBYTES 897
#define FALCON512_SECRETKEYBYTES 1281
#define FALCON512_BYTES 40  // Signature size

int main() {
    uint8_t pk[FALCON512_PUBLICKEYBYTES], sk[FALCON512_SECRETKEYBYTES];
    uint8_t sig[FALCON512_BYTES], msg[32] = "Falcon test msg";

    // Keygen
    if (crypto_sign_keypair(pk, sk) != 0) return -1;
    printf("PK size: %d bytes\n", FALCON512_PUBLICKEYBYTES);

    // Sign
    size_t siglen = FALCON512_BYTES;
    if (crypto_sign_signature(msg, 32, sig, &siglen, sk) != 0) return -1;
    printf("Sig size: %zu bytes\n", siglen);

    // Verify
    if (crypto_sign_verify(msg, 32, sig, siglen, pk) != 0) {
        printf("Verification failed\n");
    } else {
        printf("Success! Falcon sig verified.\n");
    }

    return 0;
}
