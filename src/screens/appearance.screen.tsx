import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Image, Dimensions, Appearance } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { constants, eventManager, globals, settingsGlobals } from '@globals';
import { themeStyles, updateThemeStyles } from '@styles';
import { SelectListControl } from '@controls/selectList.control';
import { api, cache } from '@services';
import { signing } from '@services/authorization/signing';
import CloutFeedButton from '@components/cloutfeedButton.component';
import { ChangeFollowersEvent, CloutFeedTheme, EventType } from '@types';
import { StackNavigationProp } from '@react-navigation/stack';
import { ParamListBase } from '@react-navigation/native';

interface Props {
    navigation: StackNavigationProp<ParamListBase>
}

export function AppearanceScreen({ navigation }: Props) {

    const isMounted = useRef<boolean>(true);

    const [isWorking, setIsWorking] = useState<boolean>(false);
    const [selectedTheme, setSelectedTheme] = useState<CloutFeedTheme>();

    useEffect(
        () => {
            initScreen();
            return () => { isMounted.current = false; };
        },
        []
    );

    async function initScreen() {
        const key = globals.user.publicKey + constants.localStorage_appearance;
        const response = await SecureStore.getItemAsync(key).catch(() => undefined) as CloutFeedTheme;
        const appearance = response === null ? CloutFeedTheme.Light : response;
        if (isMounted) {
            setSelectedTheme(appearance);
        }
    }

    async function changeTheme(theme: string) {
        if (selectedTheme === theme) {
            return;
        }
        let currentSelectedTheme = theme;
        if (theme === CloutFeedTheme.Automatic) {
            currentSelectedTheme = Appearance.getColorScheme() as string;
        }
        settingsGlobals.darkMode = currentSelectedTheme === 'dark';
        await updateTheme(theme);
    }

    async function updateTheme(theme: string) {
        const key = globals.user.publicKey + constants.localStorage_appearance;
        try {
            await SecureStore.setItemAsync(key, theme);
            updateThemeStyles();
            globals.onLoginSuccess();
        } catch (error) {
            globals.defaultHandleError(error);
        }
    }

    function openProfile() {
        const publicKey: string = 'BC1YLhaNDjrR61uZxeEkAMUAkrWMAtD2sfdefqUTJQXqf8U77jmWvfH';
        const username = 'PostaN';
        (navigation).push(
            'UserProfile',
            {
                publicKey,
                username,
                key: `Profile_${publicKey}`
            }
        );
    }

    async function onFollowPress() {
        if (isMounted) {
            setIsWorking(true);
        }
        try {
            const publicKey: string = 'BC1YLhaNDjrR61uZxeEkAMUAkrWMAtD2sfdefqUTJQXqf8U77jmWvfH';
            const response = await api.createFollow(globals.user.publicKey, publicKey, false);

            const transactionHex: string = response.TransactionHex;
            const signedTransactionHex: string = await signing.signTransaction(transactionHex);
            await api.submitTransaction(signedTransactionHex);

            if (isMounted) {
                const event: ChangeFollowersEvent = { publicKey };
                eventManager.dispatchEvent(EventType.IncreaseFollowers, event);
                globals.followerFeatures = true;
            }
            cache.addFollower(publicKey);

        } catch (error) {
            globals.defaultHandleError(error);
        } finally {
            if (isMounted) {
                setIsWorking(false);
            }
        }
    }

    return <View style={[styles.container, themeStyles.containerColorMain]}>
        <SelectListControl
            style={[styles.selectList, themeStyles.borderColor]}
            options={[
                {
                    name: 'Automatic',
                    value: CloutFeedTheme.Automatic
                },
                {
                    name: 'Light',
                    value: CloutFeedTheme.Light
                },
                {
                    name: 'Dark',
                    value: CloutFeedTheme.Dark
                },
            ]}
            value={selectedTheme}
            onValueChange={(theme: string | string[]) => changeTheme(theme as string)}
        >
        </SelectListControl>
    </View>;
}

const styles = StyleSheet.create(
    {
        container: {
            flex: 1,
        },
        lockContainer: {
            flex: 1,
            justifyContent: 'center'
        },
        selectList: {
            borderBottomWidth: 1
        },
        iconContainer: {
            alignItems: 'center',
        },
        lockTextContainer: {
            marginTop: 20,
            marginBottom: 30
        },
        lockText: {
            fontSize: 18,
            textAlign: 'center',
        },
        followBtnContainer: {
            marginLeft: 'auto',
            marginRight: 'auto'
        },
        lockImage: {
            width: 200,
            height: 200,
        },
        followBtn: {
            paddingVertical: 10,
            width: Dimensions.get('screen').width * 0.4
        }
    }
);
