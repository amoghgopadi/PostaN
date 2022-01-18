import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Animated, Text } from 'react-native';
import { Message } from '@types';
import { TextWithLinks } from './textWithLinks.component';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { StackNavigationProp } from '@react-navigation/stack';
import { themeStyles } from '@styles/globalColors';
import { snackbar } from '@services/snackbar';
import { settingsGlobals } from '@globals/settingsGlobals';
import { calculateDurationUntilNow, getCurrentTime } from '@services/helpers';
import { globals } from '@globals/globals';

export function MessageComponent(
    { message }: { message: Message }
): JSX.Element {

    const animatedMessage = useRef(new Animated.Value(100));
    const animationTiming = 150;
    const isSentNow = calculateDurationUntilNow(message?.TstampNanos) === '0s';
    const currentTime = getCurrentTime(message?.TstampNanos);

    useEffect(
        () => {
            if (isSentNow) {
                Animated.timing(
                    animatedMessage.current,
                    {
                        toValue: 0,
                        useNativeDriver: true,
                        duration: animationTiming,
                    }
                ).start();
            }
        },
        []
    );

    function copyToClipBoard() {
        Clipboard.setString(message.DecryptedText as string);
        snackbar.showSnackBar({ text: 'Message copied to clipboard' });
    }
    function checkIsEmoji(message: string) {
        const regex = /^(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])+$/g;
        const emojis = message?.trim().match(regex);

        return emojis;
    }

    const decryptedMessage = message?.DecryptedText as string;
    const isEmoji = checkIsEmoji(decryptedMessage);
    const navigation = useNavigation<StackNavigationProp<ParamListBase>>();
    const leftArrowBackgroundColor = settingsGlobals.darkMode ? '#292929' : '#dedede';
    const arrowStyles = message.IsSender ? [styles.rightArrow, themeStyles.verificationBadgeBackgroundColor] : [styles.leftArrow, { backgroundColor: leftArrowBackgroundColor }];
    const arrowOverlap = message.IsSender ? [styles.rightArrowOverlap, themeStyles.containerColorMain] : [styles.leftArrowOverlap, themeStyles.containerColorMain];
    const messageContainerStyleType = message.IsSender ? [styles.rightArrowContainer, themeStyles.verificationBadgeBackgroundColor] : [styles.leftArrowContainer, { backgroundColor: leftArrowBackgroundColor }];
    const color = message.IsSender ? 'white' : themeStyles.fontColorMain.color;
    const currentTimeColor = message.IsSender ? 'rgba(255,255,255,0.65)' : themeStyles.fontColorSub.color;
    const wordsLength = globals.isDeviceTablet ? 80 : 30;
    return <Animated.View
        style={
            [
                styles.messageContainer,
                messageContainerStyleType,
                isSentNow && {
                    transform: [
                        { translateY: animatedMessage.current },
                    ],
                },
                message.LastOfGroup && styles.messageContainerMargin
            ]
        }>
        <TouchableOpacity
            activeOpacity={0.6}
            onLongPress={copyToClipBoard}
        >
            <TextWithLinks
                style={
                    [
                        decryptedMessage.length < wordsLength && { marginRight: 50 },
                        styles.messageText,
                        { color },
                        isEmoji && styles.emojiStyle
                    ]
                }
                navigation={navigation}
                text={decryptedMessage}
            />
        </TouchableOpacity>
        <Text style={[styles.currentTime, { color: currentTimeColor }]}>{currentTime}</Text>
        {
            message.LastOfGroup &&
            <>
                <View style={arrowStyles} />
                <View style={arrowOverlap} />
            </>
        }
    </Animated.View>;
}

const styles = StyleSheet.create(
    {
        messageContainer: {
            marginVertical: 1,
            paddingVertical: 8,
            paddingHorizontal: 10,
            borderRadius: 10,
            minWidth: 130,
            maxWidth: '80%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 1,
            marginBottom: 2,
            paddingBottom: 13
        },
        messageContainerMargin: {
            marginBottom: 6
        },
        messageText: {
            fontSize: 16
        },
        currentTime: {
            position: 'absolute',
            bottom: 2,
            right: 10,
            fontSize: 9.5,
            textAlign: 'right'
        },
        leftArrowContainer: {
            backgroundColor: '#dedede',
            alignSelf: 'flex-end',
            marginLeft: '2%',
        },
        leftArrowOverlap: {
            position: 'absolute',
            width: 20,
            height: 35,
            bottom: -6,
            borderBottomRightRadius: 18,
            left: -19.7
        },
        leftArrow: {
            position: 'absolute',
            backgroundColor: '#dedede',
            width: 20,
            height: 17,
            bottom: 0,
            borderBottomRightRadius: 25,
            left: -10
        },
        rightArrowContainer: {
            marginRight: '2%',
            alignSelf: 'flex-start',
            marginLeft: 'auto'
        },
        rightArrowOverlap: {
            position: 'absolute',
            width: 20,
            height: 35,
            right: -20,
            bottom: -6,
            borderBottomLeftRadius: 25,
        },
        rightArrow: {
            position: 'absolute',
            width: 20,
            height: 17,
            bottom: 0,
            borderBottomLeftRadius: 25,
            right: -10
        },
        emojiStyle: {
            fontSize: 35,
        }
    }
);
