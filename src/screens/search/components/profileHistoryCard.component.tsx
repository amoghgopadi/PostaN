import { themeStyles } from '@styles/globalColors';
import React from 'react';
import { Text, StyleSheet, View, TouchableOpacity, FlatList, Image } from 'react-native';
import { SearchHistoryProfile } from '@types';
import { MaterialIcons, } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { ParamListBase } from '@react-navigation/routers';
import { snackbar } from '@services/snackbar';
// this is needed to prevent changing tab on scroll
import { TouchableOpacity as TouchableOpacityGesture } from 'react-native-gesture-handler';
import SearchHistoryHeaderComponent from './searchHistoryHeader.component';

interface Props {
    navigation: StackNavigationProp<ParamListBase>;
    handleSearchHistory: (profile: SearchHistoryProfile) => void;
    historyProfiles: SearchHistoryProfile[];
    clearSearchHistory: () => Promise<void>;
}

interface State {
    isClearHistoryLoading: boolean;
    showClearText: boolean;
    historyProfiles: SearchHistoryProfile[];
}

export default class ProfileHistoryCardComponent extends React.Component<Props, State> {

    private _isMounted = false;

    constructor(props: Props) {
        super(props);

        this.state = {
            isClearHistoryLoading: false,
            showClearText: false,
            historyProfiles: this.props.historyProfiles
        };

        this.goToProfile = this.goToProfile.bind(this);
        this.clearSearchHistory = this.clearSearchHistory.bind(this);
    }

    componentDidMount(): void {
        this._isMounted = true;
    }

    componentWillUnmount(): void {
        this._isMounted = false;
    }

    private async clearSearchHistory() {
        this.setState({ isClearHistoryLoading: true });
        await this.props.clearSearchHistory();

        snackbar.showSnackBar({ text: 'History cleared successfully' });

        if (this._isMounted) {
            this.setState({ historyProfiles: [], isClearHistoryLoading: false });
        }
    }

    private goToProfile(profile: SearchHistoryProfile): void {
        this.props.handleSearchHistory(profile);
        this.props.navigation.push(
            'UserProfile',
            {
                publicKey: profile.PublicKeyBase58Check,
                username: profile.Username,
                key: 'Profile_' + profile.PublicKeyBase58Check
            }
        );
    }

    render(): JSX.Element {
        const keyExtractor = (item: SearchHistoryProfile, index: number): string => `${item.PublicKeyBase58Check}_${index}`;
        const renderItems = ({ item }: { item: SearchHistoryProfile }): JSX.Element => <TouchableOpacity
            activeOpacity={1}
            onPress={() => this.goToProfile(item)}
            style={styles.profileContainer}
        >
            <Image source={{ uri: item?.ProfilePic }} style={styles.profileImage} />
            <View style={styles.nameContainer}>
                <Text numberOfLines={2} style={[styles.username, themeStyles.fontColorSub]}>{item.Username}</Text>
                {
                    item?.IsVerified &&
                    <MaterialIcons name="verified" size={16} style={styles.verified} color={themeStyles.verificationBadgeBackgroundColor.backgroundColor} />
                }
            </View>
        </TouchableOpacity>;

        return <>
            <SearchHistoryHeaderComponent
                isClearHistoryLoading={this.state.isClearHistoryLoading}
                clearSearchHistory={this.clearSearchHistory} />
            <TouchableOpacityGesture activeOpacity={1}>
                <FlatList
                    horizontal
                    bounces={false}
                    contentContainerStyle={styles.flatListStyle}
                    data={this.state.historyProfiles}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={keyExtractor}
                    renderItem={renderItems}
                />
            </TouchableOpacityGesture>
        </>;
    }
}

const styles = StyleSheet.create(
    {
        flatListStyle: {
            marginVertical: 20,
            paddingRight: 10,
            height: 80
        },
        profileContainer: {
            alignItems: 'center',
            width: 85,
        },
        profileImage: {
            width: 60,
            height: 60,
            borderRadius: 30
        },
        username: {
            fontSize: 11,
            textAlign: 'center',
            paddingRight: 3,
            width: '70%'
        },
        nameContainer: {
            paddingVertical: 3,
            alignItems: 'center',
            width: '100%',
        },
        verified: {
            position: 'absolute',
            right: 0,
            top: 2
        }
    }
);
