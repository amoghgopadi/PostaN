import React from 'react';
import { CloutCastPromotion, EventType, HiddenNFTType, Post, ToggleHideNFTsEvent } from '@types';
import { StyleSheet, View } from 'react-native';
import { PostComponent } from '@components/post/post.component';
import { CloutCastPostRequirementsComponent } from './cloutCastPostRequirements.component';
import { CloutCastPostActionsComponent } from './cloutCastPostActions.component';
import { themeStyles } from '@styles/globalColors';
import { StackNavigationProp } from '@react-navigation/stack';
import { ParamListBase, RouteProp } from '@react-navigation/native';
import { globals } from '@globals/globals';
import { eventManager } from '@globals/injector';

interface Props {
    navigation: StackNavigationProp<ParamListBase>;
    route: RouteProp<ParamListBase, string>;
    promotion: CloutCastPromotion;
    isPostScreen?: boolean;
}

interface State {
    hiddenNFTType: HiddenNFTType;
    areNFTsHidden: boolean;
}

export class CloutCastPostComponent extends React.Component<Props, State> {

    private _isMounted = false;

    private _unsubscribeHideNFTsEvent: () => void = () => undefined;

    constructor(props: Props) {
        super(props);

        this.state = {
            hiddenNFTType: HiddenNFTType.None,
            areNFTsHidden: false,
        };

        this.subscribeToggleHideNFTOptions();
    }

    componentDidMount(): void {
        this._isMounted = true;
    }

    componentWillUnmount(): void {
        this._isMounted = false;
        this._unsubscribeHideNFTsEvent();
    }

    private subscribeToggleHideNFTOptions(): void {
        this._unsubscribeHideNFTsEvent = eventManager.addEventListener(
            EventType.ToggleHideNFTs,
            (event: ToggleHideNFTsEvent) => {
                if (this._isMounted) {
                    this.setState(
                        {
                            hiddenNFTType: event.type,
                            areNFTsHidden: event.hidden
                        }
                    );
                }
            }
        );
    }

    render(): JSX.Element {

        const post = this.props.promotion.post as Post;
        if (
            (
                post?.IsNFT ||
                post.RepostedPostEntryResponse?.IsNFT ||
                post.RepostedPostEntryResponse?.RepostedPostEntryResponse?.IsNFT ||
                post.RepostedPostEntryResponse?.RepostedPostEntryResponse?.RepostedPostEntryResponse?.IsNFT
            ) &&
            globals.areNFTsHidden &&
            globals.hiddenNFTType === HiddenNFTType.Posts &&
            !this.props.isPostScreen
        ) {
            return <View style={{ height: 0.1, width: 0.1 }} />;
        }

        return <View style={[styles.container, themeStyles.borderColor]}>
            <CloutCastPostRequirementsComponent
                navigation={this.props.navigation}
                promotion={this.props.promotion}
            />

            <PostComponent
                route={this.props.route}
                navigation={this.props.navigation}
                post={this.props.promotion.post as Post}
                hideBottomBorder={true} />

            <CloutCastPostActionsComponent
                route={this.props.route}
                navigation={this.props.navigation}
                promotion={this.props.promotion}
            />
        </View>;
    }
}

const styles = StyleSheet.create(
    {
        container: {
            paddingBottom: 10,
            borderBottomWidth: 1
        }
    }
);
