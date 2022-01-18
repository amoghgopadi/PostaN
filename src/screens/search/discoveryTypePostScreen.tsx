import React from 'react';
import CloutFeedLoader from '@components/loader/cloutFeedLoader.component';
import { DiscoveryType, EventType, HiddenNFTType, Post } from '@types';
import { api, cloutFeedApi } from '@services';
import { RouteProp } from '@react-navigation/native';
import { FlatList, RefreshControl } from 'react-native';
import { themeStyles } from '@styles/globalColors';
import { globals } from '@globals/globals';
import { PostComponent } from '../../components/post/post.component';
import { StackNavigationProp } from '@react-navigation/stack';
import { eventManager } from '@globals/injector';

type RouteParams = {
    DiscoveryTypePost: {
        discoveryType: DiscoveryType;
    }
};

interface Props {
    route: RouteProp<RouteParams, 'DiscoveryTypePost'>;
    navigation: StackNavigationProp<any>;
}

interface State {
    isLoading: boolean;
    isRefreshing: boolean;
    posts: Post[];
    hiddenNFTOption: HiddenNFTType;
}

export class DiscoveryTypePostScreen extends React.Component<Props, State>{

    private _isMounted = false;

    private _unsubscribeHideNFTsEvent: () => void = () => undefined;

    constructor(props: Props) {
        super(props);

        this.state = {
            isLoading: true,
            isRefreshing: false,
            posts: [],
            hiddenNFTOption: HiddenNFTType.None,
        };

        this.init();

        this.init = this.init.bind(this);
        this.subscribeToggleHideNFTOptions();
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
        this._unsubscribeHideNFTsEvent();
    }

    private subscribeToggleHideNFTOptions(): void {
        this._unsubscribeHideNFTsEvent = eventManager.addEventListener(
            EventType.ToggleHideNFTs,
            () => {
                if (globals.areNFTsHidden && globals.hiddenNFTType === HiddenNFTType.Posts) {
                    this.props.navigation.pop();
                }
            }
        );
    }

    private async init() {
        try {

            if (this._isMounted) {
                this.setState({ isLoading: true });
            }

            await Promise.all(
                [
                    this.fetchPosts(),
                ]
            );
        } catch (e) {
        } finally {
            if (this._isMounted) {
                this.setState({ isLoading: false, isRefreshing: false });
            }
        }
    }

    private async fetchPosts() {
        const postHashHexes: string[] = await cloutFeedApi.getDiscoveryType(this.props.route.params.discoveryType);
        if (postHashHexes?.length > 0) {
            const requests = postHashHexes?.map(postHashHex => api.getSinglePost(globals.user.publicKey, postHashHex, false, 0, 0).catch(() => undefined));
            const response = await Promise.all(requests);
            const posts: Post[] = response.filter(response => !!response).map(response => response.PostFound);

            if (this._isMounted) {
                this.setState({ posts });
            }
        }
    }

    render() {
        if (this.state.isLoading) {
            return <CloutFeedLoader />;
        }

        const keyExtractor = (item: Post, index: number) => item.PostHashHex + index;
        const renderItem = ({ item }: { item: Post }) => {
            return <PostComponent
                route={this.props.route}
                navigation={this.props.navigation}
                post={item} />;
        };

        return <FlatList
            style={themeStyles.containerColorMain}
            data={this.state.posts}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            onEndReachedThreshold={3}
            maxToRenderPerBatch={20}
            windowSize={20}
            refreshControl={
                <RefreshControl
                    refreshing={this.state.isRefreshing}
                    onRefresh={this.init}
                    tintColor={themeStyles.fontColorMain.color}
                    titleColor={themeStyles.fontColorMain.color}
                />
            }
        />;
    }
}
