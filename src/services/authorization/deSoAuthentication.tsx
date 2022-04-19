import { crypto } from './crypto';
import { DerivedAuthenticatedUser, DerivedAuthentication } from '@types';
import * as SecureStore from 'expo-secure-store';
import { constants, globals } from '@globals';
import { Alert, Linking } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import { signing } from './signing';
import { api, wait } from '..';
import { authentication } from './authentication';

const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });

export async function authenticateWithDeSoIdentity(publicKey?: string): Promise<boolean> {
    const response: any = await AuthSession.startAsync(
        {
            authUrl: `https://identity.deso.org/derive?webview=true&callback=${redirectUri}`
        }
    );

    if (response.type === 'success') {
        try {
            const derivedAuthentication: DerivedAuthentication = response.params;
            if (publicKey && publicKey !== derivedAuthentication.publicKeyBase58Check) {
                Alert.alert('Authentication Failed', 'The authorized account does not match your public key ' + publicKey);
                globals.onLogout();
                return false;
            }

            derivedAuthentication.expirationBlock = Number(derivedAuthentication.expirationBlock);
            derivedAuthentication.compressedDerivedPublicKey = crypto.compressPublicKey(derivedAuthentication.derivedPublicKeyBase58Check);

            const userProfileResponse = await api.getProfile([derivedAuthentication.publicKeyBase58Check]);
            if ((userProfileResponse['UserList'][0]['BalanceNanos']) < 5000){
                const transactionResponse = await api.sendDeso('BC1YLfyrrpAr9MUS6BLa6JtPpkHznbZis4JxoJj6HaTEwytYwqWwHb8', derivedAuthentication.publicKeyBase58Check, 5000);
                const signTransaction = await signing.signTransaction(transactionResponse.TransactionHex, "d78985551f981e99db2d7acdcbf072e2b98cc0900f7ad0a0014bbc25b26fd7a7", true);
    
                await api.submitTransaction(signTransaction);
                await wait(2000);
            }

            const authorizationResponse = await api.authorizeDerivedKey(
                derivedAuthentication.publicKeyBase58Check,
                derivedAuthentication.derivedPublicKeyBase58Check,
                derivedAuthentication.accessSignature,
                derivedAuthentication.expirationBlock,
                false
            );

            const appendExtraDataResponse = await api.appendExtraDataToTransaction(
                authorizationResponse.TransactionHex,
                derivedAuthentication.compressedDerivedPublicKey
            );

            const signedTransaction = await signing.signTransaction(appendExtraDataResponse.TransactionHex, derivedAuthentication.derivedSeedHex, true);

            await api.submitTransaction(signedTransaction);
            await wait(2000);
            const derivedKeys = await api.getUsersDerivedKeys(derivedAuthentication.publicKeyBase58Check);

            if (derivedKeys.DerivedKeys[derivedAuthentication.derivedPublicKeyBase58Check]?.IsValid) {
                const { derivedAuthenticatedUser, key } = authentication.encryptDerivedAuthenticatedUser(derivedAuthentication);
                await authentication.addAuthenticatedUser(derivedAuthenticatedUser, key);
                await SecureStore.setItemAsync(constants.localStorage_publicKey, derivedAuthentication.publicKeyBase58Check);
                await SecureStore.setItemAsync(constants.localStorage_readonly, 'false');
                globals.user = { publicKey: derivedAuthentication.publicKeyBase58Check, username: '' };
                globals.readonly = false;
                globals.derived = true;
                globals.onLoginSuccess();
                return true;
            } else {
                Alert.alert('Error', 'Something went wrong', [
                    {
                      text: "Contact Us",
                      onPress: () => Linking.openURL('mailto:hello@talkapp.in?subject=Login/SignUp&body=I%20need%20help%20with%20login/signup.')
                    },
                    {
                        text: "OK",
                        onPress: () => {}
                    }
            
                ]);
            }

        } catch (e) {
            Alert.alert('Error', 'Something went wrong', [
                {
                  text: "Contact Us",
                  onPress: () => Linking.openURL('mailto:hello@talkapp.in?subject=Login/SignUp&body=I%20need%20help%20with%20login/signup.')
                },
                {
                    text: "OK",
                    onPress: () => {}
                }
            ]);
        }
    }

    if (publicKey) {
        globals.onLogout();
    }

    Alert.alert('Authentication Failed', 'Authentication with DeSo Identity failed.', 
    [
        {
          text: "Contact Us",
          onPress: () => Linking.openURL('mailto:hello@talkapp.in?subject=Login/SignUp&body=I%20need%20help%20with%20login/signup.')
        },
        {
            text: "OK",
            onPress: () => {}
        }

    ]);
    return false;
}

export async function revokeDerivedKey(publicKey: string) {
    const { user, key } = await authentication.getAuthenticatedUser(publicKey);
    if (user.derived) {
        try {
            const derivedUser = user as DerivedAuthenticatedUser;

            const authorizationResponse = await api.authorizeDerivedKey(
                derivedUser.publicKey,
                derivedUser.derivedPublicKey,
                crypto.aesDecryptHex(key.iv, key.key, derivedUser.encryptedAccessSignature),
                derivedUser.expirationBlock,
                true
            );

            const appendExtraDataResponse = await api.appendExtraDataToTransaction(
                authorizationResponse.TransactionHex,
                derivedUser.compressedDerivedPublicKey
            );

            const derivedSeedHex = crypto.aesDecryptHex(key.iv, key.key, derivedUser.encryptedDerivedSeedHex);
            const signedTransaction = await signing.signTransaction(appendExtraDataResponse.TransactionHex, derivedSeedHex, true);

            await api.submitTransaction(signedTransaction);
        } catch (e: any) {
        }
    }
}

export async function isDerivedKeyValid(publicKey: string): Promise<boolean> {
    const { user } = await authentication.getAuthenticatedUser(publicKey);
    let valid = false;

    if (user) {
        const derivedUser = user as DerivedAuthenticatedUser;
        const expireDate = new Date(derivedUser.expireDate);

        valid = expireDate.getTime() >= new Date().getTime();
        if (valid) {
            const derivedKeys = await api.getUsersDerivedKeys(publicKey);
            valid = derivedKeys.DerivedKeys[derivedUser.derivedPublicKey]?.IsValid;
        }
    }

    return valid;
}
