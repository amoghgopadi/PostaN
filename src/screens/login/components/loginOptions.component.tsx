import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ParamListBase, useNavigation } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import { authenticateWithDeSoIdentity } from '@services/authorization/deSoAuthentication';
import { LoginButton } from '@types';

interface Props {
    onLoginWithUsername: () => void;
}

export function LoginOptions(props: Props): JSX.Element {

    const navigation = useNavigation<StackNavigationProp<ParamListBase>>();

    const [isWorking, setIsWorking] = useState(false);
    const isMounted = useRef<boolean>(true);

    useEffect(
        () => {
            return () => {
                isMounted.current = false;
            };
        },
        []
    );

    const loginWithDeSoIdentity = async () => {
        if (isMounted.current) {
            setIsWorking(true);
        }

        await authenticateWithDeSoIdentity();

        if (isMounted.current) {
            setIsWorking(false);
        }
    };

    if (isWorking) {
        return <ActivityIndicator
            style={styles.indicator}
            size={'large'}
            color={'#ebebeb'} />;
    }

    const buttons: LoginButton[] = [
        {
            label: 'Existing Users',
            title: 'Login',
            action: loginWithDeSoIdentity
        },
    ];

    return <View style={styles.loginOptionsContainer}>
        {
            buttons.map(
                (button: LoginButton, index: number) => <View key={index} style={{ width: '100%', alignItems: 'center' }}>
                    <Text style={styles.modeText}>{button.label}</Text>
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={button.action}
                        activeOpacity={1}
                    >
                        <Text style={styles.loginButtonText}>{button.title}</Text>
                    </TouchableOpacity>
                </View>
            )
        }
        
    </View>;
}

const styles = StyleSheet.create(
    {
        indicator: {
            marginTop: 50,
        },
        loginButton: {
            backgroundColor: '#0e86d4',
            color: 'white',
            width: '90%',
            maxWidth: 330,
            alignSelf: 'center',
            marginHorizontal: 16,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 50,
            marginBottom: 25,
            paddingBottom: 2,
            borderWidth: 1,
            borderColor: '#404040'
        },
        loginButtonText: {
            color: 'white',
            fontSize: 20,
            fontWeight: '500'
        },
        loginOptionsContainer: {
            marginTop: 20,
            width: '100%',
            height: '40%',
            justifyContent: 'space-evenly',
            alignItems: 'center'
        },
        modeText: {
            color: '#b0b3b8',
            marginBottom: 5,
            fontSize: 12
        },
        backButton: {
            paddingHorizontal: 20,
            marginBottom: 10,
        }
    }
);
