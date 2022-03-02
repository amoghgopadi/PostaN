import React from 'react'
import { Text } from 'react-native'
import { textColors } from '../values/colors'
import { fontSizes, fontFamilies } from '../values/dimens'

const RegularText = ({value, style, isGrey, isSmall, onPress, key}) => {
    return(
        <Text
         key ={key}
         onPress={onPress}
         style={[{
            color:  textColors.commonScreenText,
            fontSize: isSmall ? fontSizes.smallFontSize: fontSizes.tabFontSize,
            fontFamily: fontFamilies.regular
        }, style]}>{value}</Text>
    )
}

export default RegularText