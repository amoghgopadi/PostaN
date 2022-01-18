import React from 'react';
import { StyleSheet, View, TouchableOpacity, Animated } from 'react-native';
import { RouteProp } from '@react-navigation/core';
import { ParamListBase } from '@react-navigation/routers';
import { StackNavigationProp } from '@react-navigation/stack';
import { Post } from '@types';
import { themeStyles } from '@styles/globalColors';
import { PostComponent } from '@components/post/post.component';
import { AntDesign } from '@expo/vector-icons';
import { Swipeable, TouchableWithoutFeedback } from 'react-native-gesture-handler';

interface Props {
    navigation: StackNavigationProp<ParamListBase>;
    route: RouteProp<ParamListBase, 'Draft'>;
    draftPost: Post;
    handleDeletePost: (postHashHex: string) => void;
    draftPosts: Post[];
}

interface State {
    isLoading: boolean;
    draftPost: Post;
}

export default class DraftPostComponentComponent extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            draftPost: this.props.draftPost,
            isLoading: false,
        };

        this.goToEditPost = this.goToEditPost.bind(this);
        this.handleDeletePost = this.handleDeletePost.bind(this);
    }

    private goToEditPost(): void {
        this.props.navigation.push(
            'CreatePost',
            {
                newPost: false,
                editPost: true,
                editedPost: this.props.draftPost,
                isDraftPost: true,
                draftPosts: this.props.draftPosts
            }
        );
    }

    private handleDeletePost(): void {
        this.props.handleDeletePost(this.props.draftPost.PostHashHex);
    }

    render(): JSX.Element {

        const renderRightCancelSwipe = (dragX: any): JSX.Element => {
            const scale = dragX.interpolate({
                inputRange: [-100, 0],
                outputRange: [1, 0.3],
                extrapolate: 'clamp',
            });

            return <TouchableOpacity
                style={{ backgroundColor: '#fc6360' }}
                activeOpacity={0.7}
                onPress={() => this.handleDeletePost()}
            >
                <View style={[styles.deleteBox, themeStyles.borderColor]}>
                    <>
                        <AntDesign name="delete" size={20} color="white" />
                        <Animated.Text style=
                            {
                                [
                                    { transform: [{ scale: scale }] },
                                    styles.deleteBoxText
                                ]
                            }
                        >
                            Delete
                        </Animated.Text>
                    </>

                </View>
            </TouchableOpacity>;
        };

        return <View style={[styles.container, themeStyles.containerColorMain]}>
            <Swipeable
                rightThreshold={40}
                renderRightActions=
                {
                    (_progress: any, dragX: any) => renderRightCancelSwipe(dragX)
                }
            >
                <TouchableWithoutFeedback onPress={this.goToEditPost}>
                    <PostComponent
                        actionsDisabled={true}
                        isDraftPost={true}
                        route={this.props.route}
                        navigation={this.props.navigation}
                        post={this.props.draftPost}
                    />
                </TouchableWithoutFeedback>
            </Swipeable>
        </View>;
    }
}

const styles = StyleSheet.create(
    {
        container: {
            flex: 1
        },
        deleteBox: {
            justifyContent: 'center',
            alignItems: 'center',
            width: 80,
            height: '100%',
            borderBottomWidth: 1,
        },
        deleteBoxText: {
            color: 'white',
            paddingTop: 5,
            fontSize: 13
        }
    }
);
