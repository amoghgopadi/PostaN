import React from 'react';
import { FlatList, StyleSheet, Text, View, Animated } from 'react-native';
import { ProfileListCardComponent } from '../../components/profileListCard.component';
import { constants, globals, navigatorGlobals } from '@globals';
import { Profile, SearchHistoryProfile, User } from '@types';
import { api, cache, isNumber } from '@services';
import { themeStyles } from '@styles';
import { ParamListBase } from '@react-navigation/native';
import CloutFeedLoader from '@components/loader/cloutFeedLoader.component';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileHistoryCardComponent from './components/profileHistoryCard.component';
import { updateSearchHistory } from './services/searchHistoryHelpers';

interface Props {
    navigation: StackNavigationProp<ParamListBase>;
}

interface State {
    isLoading: boolean;
    isClearHistoryLoading: boolean;
    showClearText: boolean;
    profiles: Profile[];
    historyProfiles: SearchHistoryProfile[];
}

export class CreatorsSearchScreen extends React.Component<Props, State> {

    private _isMounted = false;

    private _timer: number | undefined = undefined;

    private _leaderBoard: Profile[] = [];

    private _lastUsernamePrefix = '';

    private _loggedInUserFollowingMap: { [key: string]: boolean } = {};

    private _focusSubscription: () => void;

    private _slideDown = new Animated.Value(-1000)

    constructor(props: Props) {
        super(props);

        this.state = {
            isLoading: true,
            isClearHistoryLoading: false,
            profiles: [],
            historyProfiles: [],
            showClearText: false
        };

        this.handleSearchHistory = this.handleSearchHistory.bind(this);
        this.clearSearchHistory = this.clearSearchHistory.bind(this);
        this.init();

        this.setSearchMethod();
        this.initHistoryProfiles();

        this._focusSubscription = this.props.navigation.addListener(
            'focus',
            () => {
                this.setSearchMethod();
                this.initHistoryProfiles();
            }
        );
    }

    componentDidMount(): void {
        this._isMounted = true;
    }

    componentWillUnmount(): void {
        this._isMounted = false;
        this._focusSubscription();
    }

    private setSearchMethod(): void {
        navigatorGlobals.searchResults = (p_usernamePrefix: string) => {
            this._lastUsernamePrefix = p_usernamePrefix;
            p_usernamePrefix = p_usernamePrefix.trim();

            if (isNumber(this._timer)) {
                window.clearTimeout(this._timer);
            }

            if (!p_usernamePrefix) {
                if (this._isMounted) {
                    this.setState({ profiles: this._leaderBoard, isLoading: false });
                }
            } else {
                if (this._isMounted) {
                    this.setState({ isLoading: true });
                }
                this._timer = window.setTimeout(
                    () => {
                        const usernamePrefixCopy = p_usernamePrefix;
                        api.searchProfiles(globals.user.publicKey, p_usernamePrefix).then(
                            response => {
                                let foundProfiles = response?.ProfilesFound;
                                if (!foundProfiles) {
                                    foundProfiles = [];
                                }

                                if (this._isMounted && this._lastUsernamePrefix === usernamePrefixCopy) {
                                    this.setState({ profiles: foundProfiles, isLoading: false });
                                }

                                this._timer = undefined;
                            }
                        ).catch(error => globals.defaultHandleError(error));
                    },
                    500
                );
            }

            if (!p_usernamePrefix) {
                this.initHistoryProfiles();
            }
        };
    }

    private async initHistoryProfiles(): Promise<void> {
        try {
            const key = `${globals.user.publicKey}_${constants.localStorage_searchHistoryProfiles}`;
            const searchHistoryProfiles = await AsyncStorage.getItem(key);
            if (this._isMounted && searchHistoryProfiles) {
                const historyProfiles = JSON.parse(searchHistoryProfiles);
                Animated.timing(
                    this._slideDown,
                    {
                        toValue: 0,
                        duration: 500,
                        useNativeDriver: true,
                    }
                ).start(),
                    this.setState({ historyProfiles });
            }
        } catch { }
    }



    private async init(): Promise<void> {
        try {
            const responses = await Promise.all(
                [
                    api.getSingleProfile('', 'BC1YLiu7a6nKQFVa3FkbeXxinGYH7zXhgafQcVDoB9LADq3NGt16dh8'),
                    api.getSingleProfile('', 'BC1YLiseqYix5kHXnjym3DPJt9NYTJeisSVLPc2SjPsShUzEXPedGQc'),
                    api.getSingleProfile('', 'BC1YLhqWp3ryfwz96XSPiXfp3nQgBt17MSx5rTJ6FqvgErGd3VBz467'),
                    api.getSingleProfile('', 'BC1YLg5zHc9diAgnCYBbK2UGXB8Lh2ihqdKEfKwhG4CWus4cLyMbgyx'),
                    api.getSingleProfile('', 'BC1YLfvzhNfD81krenhYfTfYVfQwpJvRZkGQiFfnjtsc5fW6cN3kWpd'),
                    api.getSingleProfile('', 'BC1YLfpYnJp2kFcujQLvowMH4yLx4rg3ufaaNvNzCwyTvxFNhgHvx2n'),
                    api.getSingleProfile('', 'BC1YLfp2WwJnyN1ZME2dbmFmwHxWAN6uh9hDBUbMJQPJ8ba54PGomLn'),
                    api.getSingleProfile('', 'BC1YLgPcXrbfkektnAAwKFucR79J6iwDDfqmCoFpJfxteFKU5NWAZ5a'),
                    api.getSingleProfile('', 'BC1YLhsbyEboFsvxky6U6csLYRGuxervBTzLtDjwEvWnWFUuZShfBxV'),
                    cache.user.getData(),
                ]
            );

            let foundProfiles = [];

            for (let i = 0; i < responses.length - 1; i++) {
                foundProfiles.push(responses[i]?.Profile);
            }


            if (!foundProfiles) {
                foundProfiles = [];
            }

            if (this._isMounted) {
                this.setFollowedByUserMap(responses[responses.length - 1]);
                this._leaderBoard = foundProfiles;
                this.setState({ profiles: foundProfiles, isLoading: false });
            }
        } catch (p_error) {
            globals.defaultHandleError(p_error);
        }
    }

    setFollowedByUserMap(p_user: User) {
        const followedByUserMap: { [key: string]: boolean } = {};
        const followedByUserPublicKeys = p_user.PublicKeysBase58CheckFollowedByUser;
        if (followedByUserPublicKeys?.length > 0) {
            for (let i = 0; i < followedByUserPublicKeys.length; i++) {
                followedByUserMap[followedByUserPublicKeys[i]] = true;
            }
        }
        this._loggedInUserFollowingMap = followedByUserMap;
    }

    private handleSearchHistory(profile: SearchHistoryProfile): void {
        const newProfile: SearchHistoryProfile = {
            Username: profile.Username,
            PublicKeyBase58Check: profile.PublicKeyBase58Check,
            IsVerified: profile.IsVerified,
            ProfilePic: api.getSingleProfileImage(profile.PublicKeyBase58Check)
        };
        updateSearchHistory(newProfile);
    }

    private async clearSearchHistory(): Promise<void> {
        try {
            const key = `${globals.user.publicKey}_${constants.localStorage_searchHistoryProfiles}`;
            await AsyncStorage.removeItem(key);
            this.setState({ historyProfiles: [] });
        } catch { }
    }

    render(): JSX.Element {

        const keyExtractor = (item: Profile, index: number): string => `${item.PublicKeyBase58Check}_${index}`;
        const renderHeader = (): JSX.Element => this.state.historyProfiles.length > 0 &&
            this._lastUsernamePrefix.length === 0 ?
            <Animated.View style={{ transform: [{ translateY: this._slideDown }] }} >
                <ProfileHistoryCardComponent
                    clearSearchHistory={this.clearSearchHistory}
                    navigation={this.props.navigation}
                    handleSearchHistory={this.handleSearchHistory}
                    historyProfiles={this.state.historyProfiles}
                />
                <Text style={[styles.historyTitle, themeStyles.fontColorMain]}>Top Creators</Text>
            </Animated.View> :
            <></>;

        const renderItem = ({ item }: { item: Profile }): JSX.Element => <ProfileListCardComponent
            handleSearchHistory={this.handleSearchHistory}
            profile={item}
            isFollowing={!!this._loggedInUserFollowingMap[item.PublicKeyBase58Check]}
        />;

        return this.state.isLoading ?
            <CloutFeedLoader />
            :
            <View style={[styles.container, themeStyles.containerColorMain]}>
                {
                    this.state.profiles.length > 0 ?
                        <FlatList
                            ListHeaderComponent={renderHeader}
                            data={this.state.profiles}
                            keyExtractor={keyExtractor}
                            renderItem={renderItem}
                        />
                        :
                        <Text style={[styles.noProfilesText, themeStyles.fontColorSub]}>No results found</Text>
                }
            </View>;
    }
}
const styles = StyleSheet.create(
    {
        container: {
            flex: 1
        },
        noProfilesText: {
            fontSize: 15,
            textAlign: 'center',
            marginTop: 40,
        },
        historyTitle: {
            fontSize: 17,
            fontWeight: 'bold',
            paddingLeft: 10
        },
    }
);
