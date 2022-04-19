import React from 'react';
import { Linking, Text } from 'react-native';
import { themeStyles } from '@styles/globalColors';

export interface IntroductionElement {
    title: string;
    imageUri: string;
    description: string | JSX.Element;
}

export const introduction: IntroductionElement[] = [
    {
        title: 'Welcome!',
        imageUri: require('../../../../assets/intro1.png'),
        description: <Text>PostaN is a user-friendly mobile app that allow users to access DeSo, which is a new type of social network that mixes cryptocurrency and social media. {'\n'}{'\n'}
        For more info, check
        {' '}<Text
            onPress={() => Linking.openURL('https://docs.deso.org/')}
            style={[{ fontWeight: '500' }, themeStyles.linkColor]}>
            DeSo docs
        </Text>
    </Text>
    },
    {
        title: 'Post to Earn',
        imageUri: require('../../../../assets/intro2.png'),
        description: <Text>The core mechanic for Post to Earn is called Diamond 💎 which functions very similar to a Like ❤️. The more diamonds you get on your post, the more money you earn.{'\n\n'} 
        For more info, check
        {' '}<Text
            onPress={() => Linking.openURL('https://www.openprosper.com/tools/deso-diamond-income-calculator')}
            style={[{ fontWeight: '500' }, themeStyles.linkColor]}>
            Diamond Income Calculator
            </Text>
        </Text>
    },
    
];
