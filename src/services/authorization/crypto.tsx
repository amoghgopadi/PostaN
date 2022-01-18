/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-var-requires */
const EC = require('elliptic').ec;
const HDKey = require('hdkey');
const bip39 = require('bip39');
const bs58check = require('bs58check');

global.Buffer = global.Buffer || require('buffer').Buffer;

function seedHexToPrivateKey(seedHex: string) {
    const ec2 = new EC('secp256k1');
    return ec2.keyFromPrivate(seedHex);
}

function uintToBuf(uint: number) {
    const result = [];

    while (uint >= 0x80) {
        result.push((uint & 0xff) | 0x80);
        uint >>>= 7;
    }

    result.push(uint | 0);

    return new Buffer(result);
}

function isValidMnemonic(mnemonic: string): boolean {
    try {
        bip39.mnemonicToEntropy(mnemonic);
    } catch {
        return false;
    }
    return true;
}

function keychainToSeedHex(keychain: any): string {
    return keychain.privateKey.toString('hex');
}

function mnemonicToKeychain(mnemonic: string, extraText?: string, nonStandard?: boolean) {
    const seed = bip39.mnemonicToSeedSync(mnemonic, extraText);
    return HDKey.fromMasterSeed(seed).derive("m/44'/0'/0'/0/0", nonStandard);
}

function privateKeyToDeSoPublicKey(privateKey: any) {
    const prefix = [0xcd, 0x14, 0x0];
    const key = privateKey.getPublic().encode('array', true);
    const prefixAndKey = Uint8Array.from([...prefix, ...key]);

    return bs58check.encode(prefixAndKey);
}

function mnemonicToSeedHex(seedPhrase: string, extraText?: string, nonStandard?: boolean) {
    const keychain = mnemonicToKeychain(seedPhrase, extraText, nonStandard);
    const seedHex = keychainToSeedHex(keychain);

    return seedHex;
}

function publicKeyToECBuffer(publicKey: string): Buffer {
    const decoded = bs58check.decode(publicKey);
    const payload = Uint8Array.from(decoded).slice(3);
    const ec = new EC('secp256k1');
    const publicKeyEC = ec.keyFromPublic(payload, 'array');
    return new Buffer(publicKeyEC.getPublic('array'));
}

function compressPublicKey(publicKey: string): string {
    const decoded = bs58check.decode(publicKey);
    const payload = Uint8Array.from(decoded).slice(3);
    const ec = new EC('secp256k1');
    const publicKeyEC = ec.keyFromPublic(payload, 'array');
    return publicKeyEC.getPublic(true, 'hex');
}

function aesDecryptHex(counter: string, key: string, data: string): string {
    const counterBuffer = Buffer.from(counter, 'hex');
    const keyBuffer = Buffer.from(key, 'hex');
    const dataBuffer = Buffer.from(data, 'hex');

    return ecies.aesCtrDecrypt(counterBuffer, keyBuffer, dataBuffer);
}

const ecies = require('./ecies');

export const crypto = {
    isValidMnemonic,
    mnemonicToKeychain,
    keychainToSeedHex,
    seedHexToPrivateKey,
    uintToBuf,
    privateKeyToDeSoPublicKey,
    mnemonicToSeedHex,
    aesEncrypt: (counter: Buffer, key: Buffer, data: Buffer): string => ecies.aesCtrEncrypt(counter, key, data),
    aesDecrypt: (counter: Buffer, key: Buffer, data: Buffer): string => ecies.aesCtrDecrypt(counter, key, data),
    aesDecryptHex,
    publicKeyToECBuffer,
    compressPublicKey
};
