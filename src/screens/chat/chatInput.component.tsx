import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { settingsGlobals } from '@globals/settingsGlobals';
import { themeStyles } from '@styles/globalColors';
import { Ionicons } from '@expo/vector-icons';

(TextInput as any).defaultProps.selectionColor = themeStyles.verificationBadgeBackgroundColor.backgroundColor;

interface Props {
    messageText: string;
    setMessageText: (message: string) => void
    textInputHeight: number;
    setTextInputHeight: (height: number) => void;
    onSendMessage: () => void
}

export default function ChatInputComponent({ messageText, setMessageText, setTextInputHeight, onSendMessage }: Props) {

    const [height, setHeight] = useState(35);
    const backgroundColor = settingsGlobals.darkMode ? '#292929' : 'rgba(0,0,0,0.02)';
    const placeholderBackgroundColor = settingsGlobals.darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)';
    const keyboardAppearance = settingsGlobals.darkMode ? 'dark' : 'light';

    const isMounted = useRef<boolean>(true);

    useEffect(
        () => {
            return () => { isMounted.current = false; };
        },
        []
    );

    function handleContentSizeChange(height: number) {
        if (isMounted.current) {
            setHeight(height);
            setTextInputHeight(height);
        }
    }

    return <View style={[styles.textInputContainer]}>
        <TextInput
            style={
                [
                    styles.textInput,
                    themeStyles.fontColorMain,
                    {
                        minHeight: Math.max(35, height),
                        height: Math.max(35, height),
                        maxHeight: 200,
                        backgroundColor
                    }
                ]
            }
            onContentSizeChange={
                ({ nativeEvent: { contentSize: { height } } }) => {
                    handleContentSizeChange(height);
                }
            }
            onChangeText={setMessageText}
            value={messageText}
            blurOnSubmit={false}
            textAlignVertical='top'
            multiline={true}
            maxLength={1000}
            placeholder={'Type a message'}
            placeholderTextColor={placeholderBackgroundColor}
            keyboardAppearance={keyboardAppearance}
        />
        <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.sendButtonContainer, themeStyles.verificationBadgeBackgroundColor]}
            onPress={onSendMessage}>
            <Ionicons name="arrow-up-sharp" size={24} color="white" />
        </TouchableOpacity>
    </View>;
}

const styles = StyleSheet.create(
    {
        textInputContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 10,
            marginTop: 2,
            backgroundColor: 'transparent',
            overflow: 'hidden',
        },
        textInput: {
            overflow: 'hidden',
            width: '85%',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 15,
            paddingTop: 7,
            paddingVertical: 5,
            paddingHorizontal: 10,
            fontSize: 16,
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.1)',
        },
        sendButtonContainer: {
            width: 35,
            height: 35,
            backgroundColor: 'black',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 25,
        },
    }
);
