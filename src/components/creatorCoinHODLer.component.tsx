import { ParamListBase, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatNumber, getAnonymousProfile } from '@services';
import { CreatorCoinHODLer } from '@types';
import { themeStyles } from '@styles';
import ProfileInfoCardComponent from './profileInfo/profileInfoCard.component';
import { StackNavigationProp } from '@react-navigation/stack';

interface Props {
    creatorCoinPrice: undefined | number;
    userWhoHODL: CreatorCoinHODLer;
    isHolder: boolean;
}

export function CreatorCoinHODLerComponent({ creatorCoinPrice, userWhoHODL: userWhoHODL }: Props): JSX.Element {
    const navigation = useNavigation<StackNavigationProp<ParamListBase>>();

    let mount = true;
    const [hodlerAmountCoins, setHODLerAmountCoins] = useState('');
    const [hodlerAmountUSD, setHODLerAmountUSD] = useState('');

    useEffect(
        () => {

            try {
                if (!userWhoHODL.ProfileEntryResponse) {
                    userWhoHODL.ProfileEntryResponse = getAnonymousProfile(userWhoHODL.HODLerPublicKeyBase58Check);
                }

                const hodlerAmountCoins = userWhoHODL.BalanceNanos / 1000000000;

                if (creatorCoinPrice == null) {
                    creatorCoinPrice = 0;
                }

                const hodlerAmountUSD = hodlerAmountCoins * creatorCoinPrice;
                const formattedHODLerAmountInUSD = formatNumber(hodlerAmountUSD);

                if (mount) {
                    setHODLerAmountCoins(hodlerAmountCoins.toFixed(4));
                    setHODLerAmountUSD(formattedHODLerAmountInUSD);
                }

            } catch {
                return;
            }

            return () => {
                mount = false;
            };
        },
        []
    );

    function goToProfile() {
        if (userWhoHODL.ProfileEntryResponse &&
            userWhoHODL.ProfileEntryResponse.Username !== 'anonymous') {
            navigation.push('UserProfile', {
                publicKey: userWhoHODL.ProfileEntryResponse.PublicKeyBase58Check,
                username: userWhoHODL.ProfileEntryResponse.Username,
                key: 'Profile_' + userWhoHODL.ProfileEntryResponse.PublicKeyBase58Check
            });
        }
    }

    return <TouchableOpacity
        activeOpacity={1}
        onPress={goToProfile}
        style={[styles.userWhoHODLCard, themeStyles.containerColorMain, themeStyles.borderColor]}
    >
        <ProfileInfoCardComponent
            navigation={navigation}
            profile={userWhoHODL.ProfileEntryResponse}
        />
        <View style={styles.HODLerAmountContainer}>
            <Text style={[styles.hodlerAmountCoins, themeStyles.fontColorMain]}>{hodlerAmountCoins}</Text>
            <Text style={[styles.hodlerAmountUSD, themeStyles.fontColorMain]}>~${hodlerAmountUSD}</Text>
        </View>
    </TouchableOpacity>;
}

const styles = StyleSheet.create(
    {
        userWhoHODLCard: {
            flexDirection: 'row',
            paddingVertical: 16,
            paddingHorizontal: 10,
            borderBottomWidth: 1,
            width: '100%'

        },
        HODLerAmountContainer: {
            marginLeft: 'auto',
            justifyContent: 'center'
        },
        hodlerAmountCoins: {
            fontWeight: '600',
            fontSize: 16
        },
        hodlerAmountUSD: {
            marginTop: 4,
            fontSize: 11
        }
    }
);
