import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, Alert } from 'react-native';
import { constants, globals } from '@globals';
import { Profile } from '@types';
import { api } from '@services';
import * as Clipboard from 'expo-clipboard';
import * as SecureStore from 'expo-secure-store';

interface Props {
    onBack: () => void;
}

export function LoginWithUsername(props: Props): JSX.Element {
    const [username, setUsername] = useState('');
    const [working, setWorking] = useState(false);
    const isMounted = useRef(false);

    useEffect(
        () => {
            isMounted.current = true;
            return () => {
                isMounted.current = false;
            };
        },
        []
    );

    const onLogin = async (p_username?: string) => {
        let loggedIn = false;

        try {
            p_username = p_username ? p_username : username;
            p_username = p_username.trim();

            if (!p_username) {
                return;
            }

            if (isMounted.current) {
                setWorking(true);
            }

            const response = await api.searchProfiles('', p_username, 10);
            const profiles = response.ProfilesFound as Profile[];

            if (profiles?.length > 0) {
                const profile = profiles.find(p_profile => p_profile.Username.toLocaleLowerCase() === p_username?.toLocaleLowerCase());

                if (profile) {
                    const publicKey = profile.PublicKeyBase58Check;
                    await SecureStore.setItemAsync(constants.localStorage_publicKey, publicKey);
                    await SecureStore.setItemAsync(constants.localStorage_readonly, 'true');

                    globals.user = { publicKey: publicKey, username: profile.Username };
                    globals.readonly = true;
                    globals.derived = false;
                    globals.onLoginSuccess();
                    loggedIn = true;
                }
            }

            if (!loggedIn) {
                Alert.alert('Error', 'Profile not found.');
            }

        } catch (p_error) {
            globals.defaultHandleError(p_error);
        }

        if (isMounted.current && !loggedIn) {
            setUsername('');
            setWorking(false);
        }
    };

    const onPasteAndLogin = async () => {
        if (isMounted.current) {
            setWorking(true);
        }

        try {
            const copiedUsername = await Clipboard.getStringAsync();
            if (copiedUsername) {
                setUsername(copiedUsername);
                await onLogin(copiedUsername);
            } else {
                Alert.alert('Error', 'Username is empty.');
                if (isMounted.current) {
                    setWorking(false);
                }
            }
        } catch {
            if (isMounted.current) {
                setWorking(false);
            }
            alert('Something went wrong!');
        }
    };

    const onTextChange = (p_value: string) => {
        setUsername(p_value);
    };

    const renderButton = (text: string, onPress: () => Promise<void>) => {
        return <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: working ? '#999999' : 'black' }, styles.contentWidth]}
            onPress={() => onPress()} disabled={working}
            activeOpacity={1}
        >
            <Text style={styles.loginButtonText}>{text}</Text>
        </TouchableOpacity>;
    };

    return <View style={styles.loginOptionsContainer}>
        <TextInput
            style={[styles.input, styles.contentWidth]}
            placeholder='Enter your username...'
            value={username}
            onChangeText={onTextChange}
            placeholderTextColor={'#b0b3b8'}
            keyboardAppearance={'dark'}
        />

        {
            !username ?
                renderButton('Paste & Login', () => onPasteAndLogin()) :
                renderButton('Login', () => onLogin())
        }

        <TouchableOpacity
            onPress={() => props.onBack()}
            disabled={working}
        >
            <Text style={styles.modeText}>Back</Text>
        </TouchableOpacity>
    </View>;
}

const styles = StyleSheet.create(
    {
        contentWidth: {
            width: '80%',
            maxWidth: 400
        },
        input: {
            borderWidth: 1,
            borderColor: '#777',
            paddingHorizontal: 8,
            margin: 16,
            height: 44,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#262525',
            color: '#b0b3b8',
        },
        loginButton: {
            backgroundColor: 'black',
            color: 'white',
            marginHorizontal: 16,
            marginBottom: 10,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 50,
            borderWidth: 1,
            borderColor: '#404040'
        },
        loginButtonText: {
            color: 'white',
            fontSize: 18,
            fontWeight: '500'
        },
        loginOptionsContainer: {
            marginTop: 20,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center'
        },
        modeText: {
            color: '#b0b3b8',
            marginBottom: 5,
            fontSize: 12
        },
    }
);
