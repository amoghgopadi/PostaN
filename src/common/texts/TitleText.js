import React from 'react'
import { Text } from 'react-native'
import { textColors } from '../values/colors'
import { fontSizes, fontFamilies } from '../values/dimens'

const TitleText = ({value, style}) => {
    return(
        <Text style={[{
            color: textColors.commonScreenText,
            fontSize: fontSizes.tabFontSize,
            fontFamily:  fontFamilies.semiBold
        }, style]}>{value}</Text>
    )
}

export default TitleText