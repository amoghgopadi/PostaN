import React, { useState, useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View, Keyboard } from 'react-native';
import { snackbar, SnackbarConfig, isNumber } from '@services';
import { themeStyles } from '@styles';

export function SnackbarComponent(): JSX.Element {
    const [showSnackBar, setShowSnackBar] = useState(false);
    const [text, setText] = useState('');
    const [backgroundColor, setBackgroundColor] = useState('');
    const [textColor, setTextColor] = useState('');
    const [borderColor, setBorderColor] = useState('');
    const [isKeyboardShown, setIsKeyboardShown] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        const unsubscribeShowKeyboardEvent = Keyboard.addListener('keyboardDidShow', handleShowKeyboard);
        const unsubscribeHideKeyboardEvent = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardShown(false));

        return () => {
            unsubscribeShowKeyboardEvent.remove();
            unsubscribeHideKeyboardEvent.remove();
        };
    },
        []
    );

    function handleShowKeyboard(e: any): void {
        setKeyboardHeight(e.endCoordinates.height);
        setIsKeyboardShown(true);
    }

    snackbar.showSnackBar = (p_config: SnackbarConfig) => {
        setText(p_config.text);

        let newBackgroundColor = p_config.backgroundColor;
        if (!newBackgroundColor) {
            newBackgroundColor = themeStyles.containerColorSub.backgroundColor;
            setBackgroundColor(newBackgroundColor);
        }

        let newTextColor = p_config.textColor;
        if (!newTextColor) {
            newTextColor = themeStyles.fontColorMain.color;
            setTextColor(newTextColor);
        }

        let newBorderColor = p_config.borderColor;
        if (!newBorderColor) {
            newBorderColor = themeStyles.recloutBorderColor.borderColor;
            setBorderColor(newBorderColor);
        }

        const duration = isNumber(p_config.duration) ? p_config.duration : 2000;

        setBackgroundColor(newBackgroundColor);
        setShowSnackBar(true);
        setTimeout(() => setShowSnackBar(false), duration);
    };

    const snackbarPosition = isKeyboardShown ? { bottom: keyboardHeight + 20 } : { bottom: 50 };

    return showSnackBar ?
        <View style={
            [
                styles.container,
                snackbarPosition,
                {
                    backgroundColor,
                    borderColor
                }
            ]
        }
        >
            <Text style={{ color: textColor }}>{text}</Text>
        </View>
        :
        <View></View>;
}

const styles = StyleSheet.create(
    {
        container: {
            height: 50,
            width: Dimensions.get('window').width - 40,
            position: 'absolute',
            left: 20,
            backgroundColor: 'white',
            borderRadius: 10,
            paddingLeft: 20,
            paddingRight: 20,
            justifyContent: 'center',
            borderWidth: 1
        },
    }
);
