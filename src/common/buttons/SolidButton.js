import React from 'react'
import { TouchableOpacity, Text } from 'react-native'
import { backgroundColor, borderColors, textColors } from '../values/colors'
import { heighAndWidth, radius, paddings, fontSizes } from '../values/dimens'

const SolidButton = ({
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
                borderRadius: radius.longButtonRadius,
                backgroundColor: backgroundColor.buttonBackground,
                paddingVertical: paddings.longButtonPaddingVertical,
                paddingHorizontal: paddings.longButtonPaddingHorizontal,
                justifyContent: 'center',
                alignItems: 'center'
            }, style]}
        >
            <Text style={[{
                 color: textColors.solidButtonText,
                 fontSize: fontSizes.longButtontFontSize
            }, customTextStyle]}>{buttonName}</Text>
        </TouchableOpacity>
    )
}

export default SolidButton