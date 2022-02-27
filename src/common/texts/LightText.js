import React from 'react'
import { Text } from 'react-native'
import { textColors } from '../values/colors'
import { fontSizes, fontFamilies } from '../values/dimens'

const LightText = ({value, style, isGrey, isSmall}) => {
    return(
        <Text style={[{
            color: isGrey ? textColors.greyText : textColors.commonScreenText,
            fontSize: isSmall ? fontSizes.smallFontSize: fontSizes.tabFontSize,
            fontFamily: fontFamilies.extraLight
        }, style]}>{value}</Text>
    )
}

export default LightText