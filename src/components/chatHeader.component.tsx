import React, { useEffect, useState, useRef } from 'react';
import { Alert, Dimensions, Keyboard, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { themeStyles } from '@styles';
import { ContactWithMessages, EventType } from '@types';
import { StackNavigationProp } from '@react-navigation/stack';
import MessageInfoCardComponent from './profileInfo/messageInfoCard.component';
import { signing } from '@services/authorization/signing';
import { globals } from '@globals/globals';
import { api, snackbar, cache, isPortrait } from '@services';
import * as Clipboard from 'expo-clipboard';
import { Feather } from '@expo/vector-icons';
import { eventManager } from '@globals/injector';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

export function ChatHeaderComponent(
    { contactWithMessages, contactIndex }: { contactWithMessages: ContactWithMessages, contactIndex: number }
): JSX.Element {
    const navigation = useNavigation<StackNavigationProp<ParamListBase>>();

    const [currentScreenDimension, setCurrentScreenDimension] = useState(screenWidth);
    const [isKeyboardShown, setIsKeyboardShown] = useState(false);

    const isInitiallyPortrait = useRef<boolean>(true);

    useEffect(
        () => {
            if (globals.isDeviceTablet) {
                init();
                Dimensions.addEventListener(
                    'change',
                    () => {
                        const newScreenDimension = isPortrait() ? screenWidth : screenHeight;
                        setCurrentScreenDimension(newScreenDimension);
                    }
                );
            }

            const unsubscribeShowKeyboardEvent = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardShown(true));
            const unsubscribeHideKeyboardEvent = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardShown(false));

            return () => {
                unsubscribeShowKeyboardEvent.remove();
                unsubscribeHideKeyboardEvent.remove();
            };
        },
        []
    );

    function init(): void {
        if (!isPortrait()) {
            isInitiallyPortrait.current = false;
            const newScreenDimension = screenHeight;
            setCurrentScreenDimension(newScreenDimension);
        }
    }

    async function handleBlockUser(): Promise<void> {
        const publicKey = contactWithMessages.ProfileEntryResponse?.PublicKeyBase58Check;
        const jwt = await signing.signJWT();
        const text = 'User has been blocked successfully';
        try {
            Promise.all(
                [
                    await api.blockUser(globals.user.publicKey, publicKey, jwt, false),
                    await cache.user.getData(true)
                ]
            );
            snackbar.showSnackBar({ text });
            eventManager.dispatchEvent(EventType.RefreshContactsWithMessages, { contactIndex });
            setTimeout(() => navigation.pop(), 500);
        } catch (error) {
            globals.defaultHandleError(error);
        }
    }

    function handleBlockUserAlert(): void {
        const username = contactWithMessages.ProfileEntryResponse?.Username;
        Alert.alert(
            `Block ${username}?`,
            `Are you sure you want to add ${username} to your block list?`,
            [
                {
                    text: 'Cancel',
                    onPress: () => undefined,
                    style: 'cancel'
                },
                {
                    text: 'Confirm',
                    onPress: handleBlockUser,
                    style: 'destructive'
                }
            ]
        );
    }

    function handleCopyPublicKey(): void {
        const publicKey = contactWithMessages.ProfileEntryResponse?.PublicKeyBase58Check;
        Clipboard.setString(publicKey);
        snackbar.showSnackBar({ text: 'Public key copied to clipboard' });
    }

    function toggleActionSheet(): void {
        const timeout = isKeyboardShown ? 500 : 0;
        if (isKeyboardShown) {
            Keyboard.dismiss();
        }

        setTimeout(
            () => {
                const options = ['Copy Public Key', 'Block User', 'Cancel'];
                const callback = (p_optionIndex: number) => {
                    switch (p_optionIndex) {
                        case 0:
                            handleCopyPublicKey();
                            break;
                        case 1:
                            setTimeout(handleBlockUserAlert, 1);
                            break;
                    }
                };
                eventManager.dispatchEvent(
                    EventType.ToggleActionSheet,
                    {
                        visible: true,
                        config: { options, callback, destructiveButtonIndex: [1] }
                    }
                );
            },
            timeout
        );
    }

    return <View style={[{ width: currentScreenDimension }, styles.container, themeStyles.containerColorMain, themeStyles.borderColor, styles.row]}>
        <View style={styles.row}>
            <TouchableOpacity style={styles.arrow} onPress={navigation.goBack} activeOpacity={1}>
                <Ionicons name="chevron-back" size={32} color="#007ef5" />
            </TouchableOpacity>
            <MessageInfoCardComponent
                navigation={navigation}
                profile={contactWithMessages.ProfileEntryResponse}
                isLarge
                imageSize={30}
            />
        </View>
        <TouchableOpacity style={{ padding: 2 }} onPress={toggleActionSheet} >
            <Feather name='more-vertical' size={22} color={themeStyles.fontColorMain.color} />
        </TouchableOpacity>
    </View>;
}

const styles = StyleSheet.create(
    {
        container: {
            paddingRight: 10,
            borderBottomWidth: 0.5,
            justifyContent: 'space-between',
            height: 50
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        arrow: {
            marginRight: 20
        }
    }
);
