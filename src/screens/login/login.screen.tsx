import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Image, Keyboard, Linking, ScrollView, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { constants } from '@globals';
import { LoginOptions } from './components/loginOptions.component';
import { LoginWithUsername } from './components/loginWithUsername.component';
import { backgroundColor } from '../../common/values/colors';
import BorderButton from '../../common/buttons/BorderButton';
import SolidButton from '../../common/buttons/SolidButton';

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
        <View style={[styles.container,{paddingTop: 48,}]}>
            <Image style={[styles.logo, { height: isLogoVisible ? 200 : 0 }]} source={require('../../../assets/icon-white.png')}></Image>
            <Text style={styles.title}>PostaN</Text>
            <Text style={styles.subtitle}>Powered by DeSo</Text>
        </View>    
        <View style={[styles.container, {justifyContent: 'flex-end', marginBottom: 24}]}>

                {
                loginWithUsername ?
                    <LoginWithUsername
                        onBack={() => setLoginWithUsername(false)}
                    />
                    :
                    <LoginOptions
                        onLoginWithUsername={() => setLoginWithUsername(true)} />
                 }

            <BorderButton 
                buttonName={'Get started'}
                onPress={goToSignUp}
                style={styles.signupButton}
            />
          
            
        </View>
    </ScrollView>;
}

const styles = StyleSheet.create(
    {
        container: {
            flex: 1,
            backgroundColor: backgroundColor.authFlowScreensBackground,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24
        },
        contentContainerStyle: {
            flexGrow: 1,
            backgroundColor: backgroundColor.authFlowScreensBackground,
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
            marginTop: 8,
        },
        signupButtonText: {
            color: 'white',
            fontSize: 20,
            fontWeight: '500'
        },
    }
);
