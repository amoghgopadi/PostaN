import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Image, Keyboard, Linking, ScrollView, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { constants } from '@globals';
import { LoginOptions } from './components/loginOptions.component';
import { LoginWithUsername } from './components/loginWithUsername.component';

export function LoginScreen({ navigation }: any) {
    const [isLogoVisible, setLogoVisible] = useState(true);
    const [loginWithUsername, setLoginWithUsername] = useState(false);

    useEffect(
        () => {
            checkCloutFeedIdentity();
            const subscribeToKeyboardDidShow = Keyboard.addListener('keyboardDidShow', keyboardDidShow);
            const subscribeToKeyboardDidHide = Keyboard.addListener('keyboardDidHide', keyboardDidHide);

            return () => {
                subscribeToKeyboardDidShow.remove();
                subscribeToKeyboardDidHide.remove();
            };
        },
        []
    );

    async function checkCloutFeedIdentity() {
        const cloutFeedIdentity = await SecureStore.getItemAsync(constants.localStorage_cloutFeedIdentity);

        if (!cloutFeedIdentity) {
            navigation.navigate('Login');
            await SecureStore.setItemAsync(constants.localStorage_cloutFeedIdentity, 'true');
        }
    }

    const keyboardDidShow = () => setLogoVisible(false);
    const keyboardDidHide = () => setLogoVisible(true);

    function goToSignUp(): void {
        Linking.openURL('https://postan.netlify.app?r=DTsxjT3y');
    }

    return <ScrollView
        bounces={false}
        contentContainerStyle={styles.contentContainerStyle}>
        <View style={styles.container}>
            <Image style={[styles.logo, { height: isLogoVisible ? 200 : 0 }]} source={require('../../../assets/icon-black.png')}></Image>
            <Text style={styles.title}>PostaN</Text>
            <Text style={styles.subtitle}>Powered by DeSo</Text>
        </View>    
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.signupButton}
                onPress={goToSignUp}
                activeOpacity={1}
            >
                <Text style={styles.signupButtonText}>Get Started</Text>
            </TouchableOpacity>
            {
                loginWithUsername ?
                    <LoginWithUsername
                        onBack={() => setLoginWithUsername(false)}
                    />
                    :
                    <LoginOptions
                        onLoginWithUsername={() => setLoginWithUsername(true)} />
            }
        </View>
    </ScrollView>;
}

const styles = StyleSheet.create(
    {
        container: {
            flex: 1,
            backgroundColor: '#121212',
            alignItems: 'center',
        },
        contentContainerStyle: {
            flexGrow: 1,
            backgroundColor: '#121212',
        },
        title: {
            fontSize: 36,
            fontWeight: 'bold',
            color: 'white'
        },
        subtitle: {
            fontSize: 13,
            marginBottom: 16,
            color: 'white'
        },
        logo: {
            marginTop: 30,
            height: 150,
            width: 200
        },
        signupButton: {
            backgroundColor: '#a020f0',
            color: 'white',
            width: '90%',
            maxWidth: 330,
            alignSelf: 'center',
            marginHorizontal: 16,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 20,
            paddingBottom: 2,
            borderWidth: 1,
            borderColor: '#404040'
        },
        signupButtonText: {
            color: 'white',
            fontSize: 20,
            fontWeight: '500'
        },
    }
);
