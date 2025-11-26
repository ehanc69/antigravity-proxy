#include <stdio.h>
#include <string.h>
#include "api.h"  // PQClean interface for Kyber512

#define KYBER512_PUBLICKEYBYTES 800
#define KYBER512_SECRETKEYBYTES 1632
#define KYBER512_CIPHERTEXTBYTES 768
#define KYBER512_BYTES 32  // Shared secret size

int main() {
    uint8_t pk[KYBER512_PUBLICKEYBYTES], sk[KYBER512_SECRETKEYBYTES];
    uint8_t ct[KYBER512_CIPHERTEXTBYTES], ss1[KYBER512_BYTES], ss2[KYBER512_BYTES];

    // Keygen (receiver)
    if (crypto_kem_keypair(pk, sk) != 0) {
        printf("Keygen failed\n");
        return -1;
    }
    printf("PK generated (%d bytes)\n", KYBER512_PUBLICKEYBYTES);

    // Encaps (sender)
    if (crypto_kem_enc(ct, ss1, pk) != 0) {
        printf("Encaps failed\n");
        return -1;
    }
    printf("SS1: ");
    for (int i = 0; i < 16; i++) printf("%02x", ss1[i]);
    printf("\n");

    // Decaps (receiver)
    if (crypto_kem_dec(ss2, ct, sk) != 0) {
        printf("Decaps failed\n");
        return -1;
    }
    printf("SS2: ");
    for (int i = 0; i < 16; i++) printf("%02x", ss2[i]);
    printf("\n");

    if (memcmp(ss1, ss2, KYBER512_BYTES) == 0) printf("Match! Secure KEM.\n");
    return 0;
}
