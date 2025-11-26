// sphincs_example.c
// Example using PQClean Sphincs+ (SPHINCS+-256s) for signing and verification
// This is a minimal skeleton – replace with actual PQClean API calls as needed.

#include <stdio.h>
#include "../pqclean/sign/sphincs256s/clean/api.h"

int main(void) {
    unsigned char pk[CRYPTO_PUBLICKEYBYTES];
    unsigned char sk[CRYPTO_SECRETKEYBYTES];
    unsigned char sig[CRYPTO_BYTES];
    const unsigned char msg[] = "Hello, Sphincs+!";
    unsigned long long siglen;

    // Key generation
    if (crypto_sign_keypair(pk, sk) != 0) {
        printf("Key generation failed\n");
        return 1;
    }
    // Signing
    if (crypto_sign_signature(sig, &siglen, msg, sizeof(msg)-1, sk) != 0) {
        printf("Signing failed\n");
        return 1;
    }
    // Verification
    if (crypto_sign_verify(sig, siglen, msg, sizeof(msg)-1, pk) != 0) {
        printf("Verification failed\n");
        return 1;
    }
    printf("Sphincs+ signature verified successfully!\n");
    return 0;
}
