import React, { useEffect, useState, useRef } from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/core';
import { Feather } from '@expo/vector-icons';
import { api, cache, checkIsFollowedBack, snackbar } from '@services';
import { ChangeFollowersEvent, EventType, User } from '@types';
import { constants, eventManager, globals } from '@globals';
import { themeStyles } from '@styles';
import * as Clipboard from 'expo-clipboard';
import { signing } from '@services/authorization/signing';
import NotificationSubscriptionComponent from '@screens/profile/notificationSubscription.component';
import CloutFeedButton from '@components/cloutfeedButton.component';
import { StackNavigationProp } from '@react-navigation/stack';
import { ParamListBase } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export function ProfileScreenOptionsComponent(
    { publicKey, goToChat, username }: { publicKey: string, goToChat: () => void, username: string }
): JSX.Element {

    const navigation = useNavigation<StackNavigationProp<ParamListBase>>();

    const [isFollowed, setIsFollowed] = useState<boolean | undefined>(undefined);
    const [isFollowButtonLoading, setIsFollowButtonLoading] = useState(true);
    const [isFollowingBack, setIsFollowingBack] = useState<boolean>(false);
    const [followButtonColor, setFollowButtonColor] = useState<string>('black');

    const isMounted = useRef<boolean>(true);

    useEffect(
        () => {
            init();
            return () => {
                isMounted.current = false;
            };
        },
        []
    );

    async function init(): Promise<void> {
        try {
            const response = await Promise.all(
                [
                    cache.user.getData(),
                    checkIsFollowedBack(publicKey)
                ]
            );
            if (isMounted.current) {
                checkIsFollowed(response[0]);
                setIsFollowingBack(response[1]);
                setIsFollowButtonLoading(false);
            }
        } catch { }
    }

    function checkIsFollowed(user: User): void {
        const followedByUserPublicKeys = user.PublicKeysBase58CheckFollowedByUser;

        const followed = followedByUserPublicKeys?.indexOf(publicKey);
        if (isMounted) {
            setIsFollowed(followed !== -1);
        }
    }

    function onFollowButtonClick(): Promise<void> | undefined {
        if (isFollowed === undefined) {
            return;
        }

        setFollowButtonColor(themeStyles.buttonDisabledColor.backgroundColor);

        api.createFollow(globals.user.publicKey, publicKey, isFollowed).then(
            async response => {
                const transactionHex = response.TransactionHex;

                if (publicKey === constants.postan_publicKey) {
                    globals.followerFeatures = !isFollowed;
                }

                const signedTransactionHex = await signing.signTransaction(transactionHex);
                await api.submitTransaction(signedTransactionHex);

                if (isMounted) {
                    const event: ChangeFollowersEvent = {
                        publicKey: publicKey
                    };

                    if (isFollowed) {
                        eventManager.dispatchEvent(EventType.DecreaseFollowers, event);
                    } else {
                        eventManager.dispatchEvent(EventType.IncreaseFollowers, event);
                    }

                    setIsFollowed((previousValue: boolean | undefined) => !previousValue);
                }

                if (isFollowed) {
                    cache.removeFollower(publicKey);
                } else {
                    cache.addFollower(publicKey);
                }
            }
        ).catch(
            error => globals.defaultHandleError(error)
        ).finally(() => setFollowButtonColor('black'));
    }

    async function onProfileOptionsClick(): Promise<void> {
        const user = await cache.user.getData();
        const isUserBlocked = user?.BlockedPubKeys && !!user.BlockedPubKeys[publicKey];
        const blockOptionText = isUserBlocked ? 'Unblock User' : 'Block User';

        const options = ['Open in Browser', 'Copy Public Key', blockOptionText, 'Cancel'];

        const callback = async (optionIndex: number) => {
            switch (optionIndex) {
                case 0:
                    Linking.openURL(`https://bitclout.com/u/${username}`);
                    break;
                case 1:
                    Clipboard.setString(publicKey);
                    snackbar.showSnackBar(
                        {
                            text: 'Public key copied to clipboard.'
                        }
                    );
                    break;
                case 2: {
                    const jwt = await signing.signJWT();
                    api.blockUser(globals.user.publicKey, publicKey, jwt, isUserBlocked).then(
                        async () => {
                            try {
                                const blockedText = isUserBlocked ? 'unblocked' : 'blocked';
                                await cache.user.getData(true);
                                snackbar.showSnackBar(
                                    {
                                        text: 'User has been ' + blockedText
                                    }
                                );
                                if (!isUserBlocked) {
                                    navigation.navigate(
                                        'Home',
                                        {
                                            blockedUser: publicKey
                                        }
                                    );
                                }
                            } catch {
                                Alert.alert('Error', 'Something went wrong! Please try again.');
                            }
                        }
                    ).catch(error => globals.defaultHandleError(error));
                    break;
                }
            }
        };
        eventManager.dispatchEvent(
            EventType.ToggleActionSheet,
            {
                visible: true,
                config: { options, callback, destructiveButtonIndex: [2] }
            }
        );
    }

    function goToWallet(): void {
        navigation.push(
            'UserWallet',
            {
                publicKey,
                username,
                key: 'Wallet_' + publicKey
            }
        );
    }

    const buttonTitle = isFollowed ? 'Unfollow' : isFollowingBack ? 'Follow back' : 'Follow';

    return <View style={styles.container}>
        <View style={styles.leftContainer}>
            <NotificationSubscriptionComponent publicKey={publicKey} />
            <TouchableOpacity onPress={goToWallet}>
                <Ionicons name="wallet-outline" size={28} style={[themeStyles.fontColorMain, styles.walletIcon]} />
            </TouchableOpacity>
        </View>
        <View style={styles.rightContainer}>
            <CloutFeedButton
                isLoading={isFollowButtonLoading}
                disabled={followButtonColor !== 'black'}
                title={buttonTitle}
                onPress={onFollowButtonClick}
                styles={styles.followButton}
            />
            
            <TouchableOpacity
                activeOpacity={1}
                onPress={onProfileOptionsClick}
            >
                <Feather name="more-horizontal" size={24} color={themeStyles.fontColorMain.color} />
            </TouchableOpacity>
        </View>
    </View>;
}
const styles = StyleSheet.create(
    {
        container: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
        },
        followButton: {
            marginRight: 10,
            width: 105,
            height: 30,
        },
        leftContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        walletIcon: {
            marginLeft: 10,
        },
        rightContainer: {
            flexDirection: 'row',
            alignItems: 'center'
        }
    }
);
