import React from 'react'
import { TouchableOpacity, Text } from 'react-native'
import { borderColors, textColors } from '../values/colors'
import { heighAndWidth, radius, paddings, fontSizes } from '../values/dimens'

const BorderButton = ({
    buttonName, 
    onPress,
    style,
    customTextStyle
}) => {
    return(
        <TouchableOpacity
            onPress={onPress}
            style={[{
                minWidth: heighAndWidth.buttonWidth,
                height: heighAndWidth.buttonHeight,
                borderColor: borderColors.borderButton,
                borderRadius: radius.longButtonRadius,
                paddingVertical: paddings.longButtonPaddingVertical,
                paddingHorizontal: paddings.longButtonPaddingHorizontal,
                borderWidth: heighAndWidth.borderWidth,
                justifyContent: 'center',
                alignItems: 'center'
            }, style]}
        >
            <Text style={[{
                 color: textColors.borderButtonText,
                 fontSize: fontSizes.longButtontFontSize
            }, customTextStyle]}>{buttonName}</Text>
        </TouchableOpacity>
    )
}

export default BorderButton