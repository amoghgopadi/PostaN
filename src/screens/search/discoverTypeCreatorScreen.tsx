import React from 'react';
import CloutFeedLoader from '@components/loader/cloutFeedLoader.component';
import { DiscoveryType, Profile } from '@types';
import { api, cache, cloutFeedApi, getAnonymousProfile } from '@services';
import { RouteProp } from '@react-navigation/native';
import { ProfileListCardComponent } from '@components/profileListCard.component';
import { ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { themeStyles } from '@styles/globalColors';

type RouteParams = {
    DiscoveryTypeCreator: {
        discoveryType: DiscoveryType;
    }
};

interface Props {
    route: RouteProp<RouteParams, 'DiscoveryTypeCreator'>;
}

interface State {
    isLoading: boolean;
    isLoadingMore: boolean;
    isRefreshing: boolean;
    profiles: Profile[];
}

export class DiscoveryTypeCreatorScreen extends React.Component<Props, State>{

    private _followedByUserMap: any;

    private _isMounted = false;

    private _noMoreUsers = false;

    constructor(props: Props) {
        super(props);

        this.state = {
            isLoading: true,
            isLoadingMore: false,
            isRefreshing: false,
            profiles: []
        };

        this.loadPosts = this.loadPosts.bind(this);
        this.init = this.init.bind(this);

        this.init();
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    private async init(): Promise<void> {
        this._noMoreUsers = false;
        await this.setFollowedByUserMap();
        if (this._isMounted) {
            this.setState({ profiles: [], isLoading: true });
        }

        this.loadPosts();
    }

    private async loadPosts(loadMore = false): Promise<void> {

        if (this.state.isLoadingMore || this._noMoreUsers) {
            return;
        }

        if (this._isMounted) {
            this.setState({ isLoading: !loadMore, isLoadingMore: loadMore });
        }

        try {
            await this.fetchCreators(loadMore);
        } catch (e) {
        } finally {
            if (this._isMounted) {
                this.setState(
                    {
                        isLoading: false,
                        isLoadingMore: false,
                        isRefreshing: false
                    }
                );
            }
        }
    }

    private async fetchCreators(loadMore: boolean) {
        const publicKeys: string[] = await cloutFeedApi.getDiscoveryType(this.props.route.params.discoveryType);

        const batchSize = 12;

        const profilesLength = this.state.profiles.length;
        const slicedPublicKeys = publicKeys.slice(profilesLength, profilesLength + batchSize);

        let profiles: Profile[] = [];
        const promises: Promise<Profile>[] = [];

        for (const publicKey of slicedPublicKeys) {
            const promise = new Promise<Profile | any>(
                (p_resolve, _reject) => {
                    api.getSingleProfile('', publicKey)
                        .then(
                            (response) => {
                                response.Profile.ProfilePic = api.getSingleProfileImage(publicKey);
                                p_resolve(response.Profile);
                            }
                        ).catch(() => p_resolve({ Profile: getAnonymousProfile(publicKey) }));
                }
            );
            promises.push(promise);
        }
        if (slicedPublicKeys.length < batchSize) {
            this._noMoreUsers = true;
        }

        profiles = await Promise.all(promises);
        if (loadMore) {
            profiles = this.state.profiles.concat(profiles);
        }

        if (this._isMounted) {

            this.setState(
                {
                    profiles,
                    isLoading: false,
                    isLoadingMore: false,
                }
            );
        }
    }

    private async setFollowedByUserMap() {
        const user = await cache.user.getData();

        const followedByUserMap: any = {};

        const followedByUserPublicKeys = user.PublicKeysBase58CheckFollowedByUser;

        if (followedByUserPublicKeys?.length > 0) {
            for (let i = 0; i < followedByUserPublicKeys.length; i++) {
                followedByUserMap[followedByUserPublicKeys[i]] = true;
            }
        }

        this._followedByUserMap = followedByUserMap;
    }

    render() {
        if (this.state.isLoading) {
            return <CloutFeedLoader />;
        }

        const keyExtractor = (item: Profile, index: number): string => item.PublicKeyBase58Check + index;
        const renderItem = ({ item }: { item: Profile }): JSX.Element => <ProfileListCardComponent profile={item} isFollowing={!!this._followedByUserMap[item.PublicKeyBase58Check]} />;

        const renderRefresh: JSX.Element = <RefreshControl
            tintColor={themeStyles.fontColorMain.color}
            titleColor={themeStyles.fontColorMain.color}
            refreshing={this.state.isRefreshing}
            onRefresh={this.init}
        />;

        const renderFooter = this.state.isLoadingMore ? <ActivityIndicator color={themeStyles.fontColorMain.color} /> : undefined;

        return <FlatList
            style={themeStyles.containerColorMain}
            data={this.state.profiles}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            onEndReachedThreshold={3}
            maxToRenderPerBatch={20}
            onEndReached={() => this.loadPosts(true)}
            windowSize={20}
            ListFooterComponent={renderFooter}
            refreshControl={renderRefresh}
        />;
    }
}
