import { crypto } from './crypto';
import { DerivedAuthenticatedUser } from '@types';
import KeyEncoder from 'key-encoder';
import { globals } from '@globals/globals';
import { authentication } from './authentication';
import { api } from '../api/api';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const sha256 = require('sha256');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ecies = require('./ecies');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rs = require('jsrsasign');

const JWS = rs.jws.JWS;

const header = { alg: 'ES256', typ: 'JWT' };

async function getSeedHex(): Promise<string> {
    const publicKey = globals.user.publicKey;

    const { user, key: userKey } = await authentication.getAuthenticatedUser(publicKey);

    const encryptedSeedHex = user.derived ?
        new Buffer((user as DerivedAuthenticatedUser).encryptedDerivedSeedHex, 'hex') :
        new Buffer(user.encryptedSeedHex, 'hex');

    const key = new Buffer(userKey.key, 'hex');
    const iv = new Buffer(userKey.iv, 'hex');

    let seedHex = '';
    seedHex = crypto.aesDecrypt(iv, key, encryptedSeedHex);
    return seedHex;
}

const signJWT = async (): Promise<string> => {
    if (!globals.derived) {
        const seedHex = await getSeedHex();
        const keyEncoder = new KeyEncoder('secp256k1');
        const encodedPrivateKey = keyEncoder.encodePrivate(seedHex, 'raw', 'pem');

        const expDate = new Date();
        expDate.setHours(expDate.getHours() + 1);
        expDate.setSeconds(expDate.getSeconds() + 20);

        return JWS.sign(
            header.alg,
            JSON.stringify(header),
            JSON.stringify({ exp: Math.floor(expDate.getTime() / 1000) }),
            encodedPrivateKey
        );
    } else {
        const { user, key } = await authentication.getAuthenticatedUser(globals.user.publicKey);
        const jwt = crypto.aesDecryptHex(key.iv, key.key, (user as DerivedAuthenticatedUser).encryptedJwt);
        return jwt;
    }
};

const signTransaction = async (transactionHex: string, seedHex?: string, ignoreDerived = false): Promise<string> => {
    if (globals.derived && !ignoreDerived) {
        const { user } = await authentication.getAuthenticatedUser(globals.user.publicKey);
        const appendExtraDataResponse = await api.appendExtraDataToTransaction(
            transactionHex,
            (user as DerivedAuthenticatedUser).compressedDerivedPublicKey
        );
        transactionHex = appendExtraDataResponse.TransactionHex;
    }

    if (!seedHex) {
        seedHex = await getSeedHex();
    }

    const privateKey = crypto.seedHexToPrivateKey(seedHex);

    const transactionBytes = new Buffer(transactionHex, 'hex');
    const transactionHash = new Buffer(sha256.x2(transactionBytes), 'hex');
    const signature = privateKey.sign(transactionHash);
    const signatureBytes = new Buffer(signature.toDER());
    const signatureLength = crypto.uintToBuf(signatureBytes.length);

    const signedTransactionBytes = Buffer.concat(
        [
            transactionBytes.slice(0, -1),
            signatureLength,
            signatureBytes,
        ]
    );
    return signedTransactionBytes.toString('hex');
};

const decryptData = async (encryptedHex: string): Promise<string> => {
    const seedHex = await getSeedHex();

    const privateKey = crypto.seedHexToPrivateKey(seedHex);
    const privateKeyBuffer = privateKey.getPrivate().toArrayLike(Buffer);
    const encryptedBytes = new Buffer(encryptedHex, 'hex');

    const decryptedHex = ecies.decrypt(
        privateKeyBuffer,
        encryptedBytes
    );

    return decryptedHex;
};

const encryptShared = async (publicKey: string, data: string): Promise<string> => {
    const seedHex = await getSeedHex();

    const privateKey = crypto.seedHexToPrivateKey(seedHex);
    const privateKeyBuffer = privateKey.getPrivate().toArrayLike(Buffer);
    const publicKeyBytes = crypto.publicKeyToECBuffer(publicKey);

    const encryptedHex = ecies.encryptShared(
        privateKeyBuffer,
        publicKeyBytes,
        data
    );

    return encryptedHex.toString('hex');
};

const decryptShared = async (publicKey: string, encryptedHex: string): Promise<string> => {
    const seedHex = await getSeedHex();

    const privateKey = crypto.seedHexToPrivateKey(seedHex);
    const privateKeyBuffer = privateKey.getPrivate().toArrayLike(Buffer);
    const encryptedBytes = new Buffer(encryptedHex, 'hex');
    const publicKeyBytes = crypto.publicKeyToECBuffer(publicKey);

    const decryptedHex = ecies.decryptShared(
        privateKeyBuffer,
        publicKeyBytes,
        encryptedBytes
    );

    return decryptedHex;
};

export const signing = {
    signTransaction,
    decryptData,
    signJWT,
    encryptShared,
    decryptShared
};
