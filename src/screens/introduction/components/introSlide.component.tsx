import React from 'react';
import { StyleSheet, View, Image, Text, Dimensions, ImageSourcePropType, } from 'react-native';
import { themeStyles } from '@styles/globalColors';
import { globals } from '@globals/globals';

interface Props {
    title: string;
    imageUri: string;
    description: JSX.Element | string;
    screenDimension: number;
    isInitiallyPortrait: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default class introSlideComponent extends React.Component<Props> {

    private _isMounted = false;

    constructor(props: Props) {
        super(props);
    }

    componentDidMount(): void {
        this._isMounted = true;
    }

    componentWillUnmount(): void {
        this._isMounted = false;
    }

    render(): JSX.Element {

        const imageWidth = this.props.isInitiallyPortrait ? screenWidth : screenHeight;
        const imageHeight = this.props.isInitiallyPortrait ? screenHeight : screenWidth;
        const titleFontSize = globals.isDeviceTablet ? 25 : 18;
        const subTitleFontSize = globals.isDeviceTablet ? 20 : 15;
        const width = this.props.screenDimension;
        return <View style={
            [
                styles.container,
                { width },
                globals.isDeviceTablet && { justifyContent: 'space-evenly' }
            ]
        }>
            <Image style={[styles.image, { width: imageWidth * 0.2, height: imageHeight * 0.2 }]} source={(this.props.imageUri as ImageSourcePropType)} />
            <Text style={
                [
                    { fontSize: titleFontSize },
                    styles.title,
                    themeStyles.fontColorMain
                ]
            }>{this.props.title}</Text>
            <View style={styles.descriptionContainer} >
                <Text style={
                    [
                        { fontSize: subTitleFontSize },
                        styles.description,
                        themeStyles.fontColorMain
                    ]
                }>{this.props.description}</Text>
            </View>
        </View>;
    }
}

const styles = StyleSheet.create(
    {
        container: {
            alignItems: 'center',
            padding: 20,
        },
        image: {
            aspectRatio: 1,
            marginBottom: 20
        },
        title: {
            fontWeight: 'bold',
            marginBottom: 20
        },
        description: {
            textAlign: 'center',
            fontWeight: '600',
            paddingBottom: 10,
        },
        descriptionContainer: {
            paddingHorizontal: 15,
            maxHeight: (screenHeight - 150) * 0.7
        }
    }
);
