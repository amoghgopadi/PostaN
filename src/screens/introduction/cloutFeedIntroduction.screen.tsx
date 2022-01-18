import React from 'react';
import { StyleSheet, Animated, View, ScrollView, Dimensions, Text, TouchableOpacity, Platform, FlatList } from 'react-native';
import { themeStyles } from '@styles/globalColors';
import { FontAwesome } from '@expo/vector-icons';
import IntroSlideComponent from './components/introSlide.component';
import { introduction, IntroductionElement } from './components/introContent';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { isPortrait } from '@services/helpers';
import { globals } from '@globals/globals';

interface Props {
    navigation: NavigationProp<ParamListBase>;
}

interface State {
    currentSlide: number;
    totalSlides: number;
    isNext: boolean;
    currentScreenDimension: number;
}

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

export default class CloutFeedIntroduction extends React.Component<Props, State> {

    private _isMounted = false;

    private _scrollViewRef: React.RefObject<ScrollView>;

    private _startButtonOpacity: Animated.Value = new Animated.Value(0);

    private _isInitiallyPortrait = true;

    constructor(props: Props) {
        super(props);

        this.state = {
            totalSlides: 0,
            currentSlide: 1,
            isNext: false,
            currentScreenDimension: screenWidth,
        };

        this._scrollViewRef = React.createRef();
        this.goToNext = this.goToNext.bind(this);
        this.onNavigate = this.onNavigate.bind(this);
        this.handleDimensionChange = this.handleDimensionChange.bind(this);
        if (globals.isDeviceTablet) {
            this.init = this.init.bind(this);
            this.init();
            Dimensions.addEventListener(
                'change',
                () => {
                    let currentScreenDimension = isPortrait() ? screenWidth : screenHeight;
                    if (!this._isInitiallyPortrait) {
                        currentScreenDimension = isPortrait() ? screenHeight : screenWidth;
                    }
                    if (this._isMounted) {
                        this.setState({ currentScreenDimension });
                    }
                    this.handleDimensionChange();
                }
            );
        }
    }

    componentDidMount(): void {
        this._isMounted = true;
    }

    componentWillUnmount(): void {
        this._isMounted = false;
    }

    private init(): void {
        let currentScreenDimension = screenWidth;
        if (!isPortrait()) {
            this._isInitiallyPortrait = false;
            currentScreenDimension = screenHeight;
        }
        if (this._isMounted) {
            this.setState({ currentScreenDimension });
        }
    }

    private calculateTotalSlides = (contentWidth: number) => {
        if (contentWidth !== 0) {
            const approxSlide = contentWidth / this.state.currentScreenDimension;
            if (this.state.totalSlides !== approxSlide) {
                this.setState(
                    {
                        totalSlides: parseInt(String(Math.ceil(parseInt(approxSlide.toFixed(2)))))
                    }
                );
                this.setNext(introduction.length > this.state.currentSlide);
            }
        }
    }

    private handleScrollEnd = (event: any) => {
        if (!event) {
            return;
        }
        if (event.nativeEvent && event.nativeEvent.contentOffset) {
            let currentSlide = 1;
            if (event.nativeEvent.contentOffset.x === 0) {
                this.setState({ currentSlide });
            } else {
                const approxCurrentSlide: number = event.nativeEvent.contentOffset.x / this.state.currentScreenDimension;
                const parsedApproxCurrentSlide: number = parseInt(approxCurrentSlide.toFixed(2));
                currentSlide = parseInt(String(Math.ceil(parsedApproxCurrentSlide) + 1));
                this.setState({ currentSlide });
            }
            this.setNext(this.state.totalSlides > currentSlide);
        }
    }

    private handleDimensionChange() {
        if (this._scrollViewRef) {
            (this._scrollViewRef as any)?.scrollTo({ x: 1, y: 0, animated: true });
            if (Platform.OS === 'android') {
                this.handleScrollEnd({ nativeEvent: { contentOffset: { y: 0, x: 0 } } });
            }
        }
    }

    private goToNext() {
        if (this._scrollViewRef) {
            const scrollPoint = this.state.currentSlide * this.state.currentScreenDimension;
            (this._scrollViewRef as any).scrollTo({ x: scrollPoint, y: 0, animated: true });
            if (Platform.OS === 'android') {
                this.handleScrollEnd({ nativeEvent: { contentOffset: { y: 0, x: scrollPoint } } });
            }
        }
    }

    private setNext = (status: boolean) => {
        if (status !== this.state.isNext) {
            this.setState({ isNext: status });
        }
    }

    private onNavigate() {
        if (this.state.currentSlide !== introduction.length) {
            return;
        }
        this.props.navigation.navigate('TermsConditions');
    }

    render(): JSX.Element {
        const keyExtractor = (_item: IntroductionElement, index: number) => index.toString();
        const renderDots = ({ index }: { index: number }) => <FontAwesome
            style={[styles.dot, this.state.currentSlide === index + 1 ? styles.selectedDot : styles.notSelectedDot]}
            name="circle"
            size={8}
            color="black" />;

        if (this.state.currentSlide === introduction.length) {
            Animated.timing(this._startButtonOpacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }
        else {
            Animated.timing(this._startButtonOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }

        return <ScrollView
            bounces={false}
            contentContainerStyle={globals.isDeviceTablet && styles.containerScrollViewStyle}
            style={[styles.container, themeStyles.containerColorMain]}>
            <View style={{ flex: 1 }}>
                <ScrollView
                    style={styles.scrollViewStyle}
                    ref={(ref) => { this._scrollViewRef = ref as any; }}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    decelerationRate={0}
                    snapToAlignment={'center'}
                    onContentSizeChange={this.calculateTotalSlides}
                    onMomentumScrollEnd={this.handleScrollEnd}
                >
                    {
                        introduction.map(
                            (item: IntroductionElement, index: number) => <IntroSlideComponent
                                isInitiallyPortrait={this._isInitiallyPortrait}
                                screenDimension={this.state.currentScreenDimension}
                                key={index.toString()} {...item} />
                        )
                    }
                </ScrollView>
                <View style={styles.dotsContainer}>
                    <FlatList
                        data={introduction}
                        keyExtractor={keyExtractor}
                        horizontal
                        renderItem={renderDots}
                    />
                </View>
            </View>
            <View style={styles.buttonContainer}>
                <Animated.View style={{ opacity: this._startButtonOpacity, width: '100%', maxWidth: 360 }}>
                    <TouchableOpacity onPress={() => this.onNavigate()} style={styles.button} activeOpacity={1}>
                        <Text style={styles.buttonText}>Start!</Text>
                    </TouchableOpacity>
                </Animated.View>

                <TouchableOpacity
                    style={[styles.button, !this.state.isNext && themeStyles.buttonDisabledColor]}
                    activeOpacity={1}
                    onPress={() => this.goToNext()}
                    disabled={!this.state.isNext}>
                    <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>;
    }
}

const styles = StyleSheet.create(
    {
        containerScrollViewStyle: {
            justifyContent: 'space-around',
            flexGrow: 1,
        },
        container: {
            flex: 1,
            paddingVertical: 0,
        },
        scrollViewStyle: {
            paddingTop: 20,
        },
        buttonContainer: {
            alignItems: 'center',
            marginHorizontal: 50,
            marginBottom: 20
        },
        button: {
            padding: 10,
            backgroundColor: 'black',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            maxWidth: 360,
            borderRadius: 5,
            marginVertical: 10,
        },
        buttonText: {
            color: 'white',
            fontSize: 17,
        },
        dotsContainer: {
            alignItems: 'center',
            marginBottom: 15,
        },
        dot: {
            marginRight: 4
        },
        selectedDot: {
            color: '#363636'
        },
        notSelectedDot: {
            color: '#d1d1d1'
        },
    }
);
