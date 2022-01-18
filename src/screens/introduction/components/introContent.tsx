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
        description: 'PostaN is a user-friendly mobile app that allows users to access DeSo from the convenience of their smartphones. Say goodbye to computer screens! Make the most out of DeSo with the all-new mobile experience'
    },
    {
        title: 'What is DeSo?',
        imageUri: require('../../../../assets/intro2.png'),
        description: <Text>DeSo, short for 'Decentralized Social', is a new type of social network that mixes cryptocurrency and social media. For more info, check
            {' '}<Text
                onPress={() => Linking.openURL('https://docs.deso.org/')}
                style={[{ fontWeight: '500' }, themeStyles.linkColor]}>
                DeSo docs
            </Text>{'\n'}{'\n'}{'\n'}
            DeSo has its own native cryptocurrency called $DESO that you can use to earn from posting or tip other posts.
        </Text>
    },
    {
        title: 'Post to Earn',
        imageUri: require('../../../../assets/icon-white.png'),
        description: <Text>
            The core mechanic introduced for this is called Diamond 💎 which functions very similar to a Like ❤️. The receiver of diamond 💎 on their posts will immediately get $DESO in their wallet.{'\n\n'} <Text style={[{ fontWeight: 'bold' }]}>For example, 4 posts per day with 50 diamonds per post generates a weekly income of ₹4000 in $DESO.</Text>  Moreover, this earning could potentially 10X or 100X in the future as and when $DESO price increases.{'\n'}{'\n'}
            <Text
                onPress={() => Linking.openURL('https://www.prosperclout.com/tools/deso-diamond-income-calculator')}
                style={[{ fontWeight: '500', fontSize: 18, textDecorationLine: 'underline' }, themeStyles.linkColor]}>
                Diamond Income Calculator
            </Text>
        </Text>
    },
    {
        title: 'Let\'s go!',
        imageUri: require('../../../../assets/intro5.png'),
        description: <Text>What are you waiting for? Start earning $DeSo and socializing with your friends now! Stay updated with the latest news with native notifications.{'\n '}
        </Text>,
    },
];
