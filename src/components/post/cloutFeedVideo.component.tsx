import React from 'react';
import { StyleSheet, ActivityIndicator, View, TouchableWithoutFeedback } from 'react-native';
import { themeStyles } from '@styles/globalColors';
import WebView from 'react-native-webview';
import { parseVideoLink } from '@services/videoLinkParser';

interface Props {
    embeddedVideoLink: string;
}

interface State {
    showIsolationLayer: boolean;
}

export default class CloutFeedVideoComponent extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            showIsolationLayer: true
        };
    }

    shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
        return nextProps.embeddedVideoLink !== this.props.embeddedVideoLink ||
            nextState.showIsolationLayer !== this.state.showIsolationLayer;
    }

    render(): JSX.Element {
        const parsedVideoLink = this.props.embeddedVideoLink && parseVideoLink(this.props.embeddedVideoLink);

        if (!parsedVideoLink) {
            return <></>;
        }

        const renderLoadingView = () => <ActivityIndicator size='large'
            style={[styles.activityIndicator, themeStyles.containerColorMain]}
            color={themeStyles.fontColorMain.color} />;

        return (
            <View style={[styles.videoContainer, themeStyles.containerColorMain]}>

                <TouchableWithoutFeedback style={[styles.videoContainer, themeStyles.containerColorMain]}
                    onPress={() => {
                        this.setState({ showIsolationLayer: false });
                    }}>
                    <WebView
                        renderLoading={renderLoadingView}
                        startInLoadingState={true}
                        scalesPageToFit
                        style={[styles.videoContainer, themeStyles.containerColorMain]}
                        source={{ uri: parsedVideoLink.videoLink }}
                        scrollEnabled={true}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        mediaPlaybackRequiresUserAction={true}
                    />
                </TouchableWithoutFeedback>

                {
                    parsedVideoLink.type === 'youtube' && this.state.showIsolationLayer &&
                    <>
                        <View style={styles.rightIsolationLayer} >
                        </View>
                        <View style={styles.leftIsolationLayer} >
                        </View>
                        <View style={styles.topIsolationLayer} >
                        </View>
                        <View style={styles.bottomIsolationLayer} >
                        </View>
                    </>
                }
            </View>
        );
    }
}

const styles = StyleSheet.create(
    {
        videoContainer: {
            height: 400,
            opacity: 0.99
        },
        activityIndicator: {
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0
        },
        rightIsolationLayer: {
            position: 'absolute',
            width: '40%',
            height: 325,
            top: 0,
            right: 0,
            backgroundColor: 'transparent'
        },
        leftIsolationLayer: {
            position: 'absolute',
            width: '40%',
            height: 325,
            top: 0,
            left: 0,
            backgroundColor: 'transparent'
        },
        topIsolationLayer: {
            position: 'absolute',
            width: '100%',
            height: '30%',
            top: 0,
            right: 0,
            left: 0,
            backgroundColor: 'transparent'
        },
        bottomIsolationLayer: {
            position: 'absolute',
            width: '100%',
            height: '30%',
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'transparent'
        }
    }
);
