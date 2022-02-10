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
        DeSo has its own native cryptocurrency called $DESO that you can earn from posting or use to tip other posts. {'\n'}{'\n'}
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
        imageUri: require('../../../../assets/icon-white.png'),
        description: <Text>
            The core mechanic introduced for this is called Diamond 💎 which functions very similar to a Like ❤️. The receiver of diamond 💎 on their posts will immediately get $DESO in their wallet.{'\n\n'} <Text style={[{ fontWeight: 'bold' }]}>For example, 4 posts per day with 50 diamonds per post generates a weekly income of ₹4000 in $DESO.</Text>  Moreover, this earning could potentially 10X or 100X in the future as and when $DESO price increases.{'\n'}{'\n'}
            <Text
                onPress={() => Linking.openURL('https://www.openprosper.com/tools/deso-diamond-income-calculator')}
                style={[{ fontWeight: '500', fontSize: 18, textDecorationLine: 'underline' }, themeStyles.linkColor]}>
                Diamond Income Calculator
            </Text>
        </Text>
    },
    
];
