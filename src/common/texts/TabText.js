import React from 'react'
import { Text } from 'react-native'
import { textColors } from '../values/colors'
import { fontSizes, fontFamilies } from '../values/dimens'

const TabText = ({value, style, isSelected}) => {
    return(
        <Text style={[{
            color: isSelected ? textColors.highlightedTabColor : textColors.commonScreenText,
            fontSize: fontSizes.tabFontSize,
            fontFamily: isSelected ? fontFamilies.bold : fontFamilies.semiBold
        }, style]}>{value}</Text>
    )
}

export default TabText