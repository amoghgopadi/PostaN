import { ParamListBase } from '@react-navigation/routers';
import { StackNavigationProp } from '@react-navigation/stack';
import { themeStyles } from '@styles/globalColors';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { EventType, Post, ToggleRefreshDraftPostsEvent } from '@types';
import { RouteProp } from '@react-navigation/core';
import DraftPostComponentComponent from './components/draftPostComponent.component';
import { globals } from '@globals/globals';
import { constants } from '@globals/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { eventManager } from '@globals/injector';

type RouteParams = {
    Draft: {
        draftPosts: Post[];
    }
};

interface Props {
    navigation: StackNavigationProp<ParamListBase>;
    route: RouteProp<RouteParams, 'Draft'>;
}

interface State {
    draftPosts: Post[];
    isLoadingMore: boolean;
}

export default class DraftPostsScreen extends React.Component<Props, State> {

    private _isMounted = false;

    private _unsubscribeRefreshDrafts: (() => void) = () => { };

    constructor(props: Props) {
        super(props);

        this.state = {
            isLoadingMore: false,
            draftPosts: [],
        };

        this.init = this.init.bind(this);
        this.handleDeletePost = this.handleDeletePost.bind(this);

        this.init();
        this.subscribeToggleHideNFTOptions();
    }

    componentDidMount(): void {
        this._isMounted = true;
    }

    componentWillUnmount(): void {
        this._isMounted = false;

        this._unsubscribeRefreshDrafts();
    }

    private subscribeToggleHideNFTOptions(): void {
        this._unsubscribeRefreshDrafts = eventManager.addEventListener(
            EventType.ToggleRefreshDraftPosts,
            (event: ToggleRefreshDraftPostsEvent) => {
                if (this._isMounted) {
                    this.setState({ draftPosts: event.draftPosts });
                }
            }
        );
    }

    private async init(): Promise<void> {
        try {
            const key = `${globals.user.publicKey}_${constants.localStorage_draftPost}`;
            const oldDrafts = await AsyncStorage.getItem(key);
            if (oldDrafts) {
                const oldDraftsArr = JSON.parse(oldDrafts);
                if (this._isMounted) {
                    this.setState({ draftPosts: oldDraftsArr });
                }
            }
        } catch { }
    }

    private async handleDeletePost(postHashHex: string): Promise<void> {
        const filteredDraftPosts = this.state.draftPosts.filter((post: Post) => post.PostHashHex !== postHashHex);
        const key = `${globals.user.publicKey}_${constants.localStorage_draftPost}`;
        if (filteredDraftPosts.length === 0) {
            await AsyncStorage.removeItem(key);
        } else {
            await AsyncStorage.setItem(key, JSON.stringify(filteredDraftPosts));
        }
        if (this._isMounted) {
            this.setState({ draftPosts: filteredDraftPosts });
        }
    }

    render(): JSX.Element {

        const keyExtractor = (item: Post, index: number) => item.PostHashHex + String(index);
        const renderItem = ({ item }: { item: Post }) => <DraftPostComponentComponent
            draftPosts={this.state.draftPosts}
            handleDeletePost={this.handleDeletePost}
            route={this.props.route}
            navigation={this.props.navigation}
            draftPost={item}
        />;

        return <View style={[styles.container, themeStyles.containerColorMain]}>
            {
                this.state.draftPosts.length === 0 ?
                    <Text style={[themeStyles.fontColorSub, styles.emptyFollowers]}>
                        You don't have any draft posts
                    </Text>
                    :
                    <FlatList
                        data={this.state.draftPosts}
                        renderItem={renderItem}
                        keyExtractor={keyExtractor}
                    />
            }
        </View>;
    }
}

const styles = StyleSheet.create(
    {
        container: {
            flex: 1
        },
        emptyFollowers: {
            fontSize: 17,
            paddingTop: 40,
            textAlign: 'center'
        }
    }
);
