import React from 'react';
import { ParamListBase } from '@react-navigation/native';
import { StyleSheet, FlatList, Text, View, Animated } from 'react-native';
import { cloutApi } from '@services/api/cloutApi';
import { CloutTag } from '@types';
import { themeStyles } from '@styles/globalColors';
import { isNumber } from '@services/helpers';
import { navigatorGlobals } from '@globals/navigatorGlobals';
import { globals } from '@globals/globals';
import CloutTagListCardComponent from './components/cloutTagCard.component';
import CloutFeedLoader from '@components/loader/cloutFeedLoader.component';
import { StackNavigationProp } from '@react-navigation/stack';
import { constants } from '@globals/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CloutTagHistoryCardComponentComponent from './components/cloutTagHistoryCardComponent.component';

interface Props {
    navigation: StackNavigationProp<ParamListBase>;
}

interface State {
    isLoading: boolean;
    cloutTags: CloutTag[];
    historyCloutTags: string[];
}

export default class CloutTagSearchScreen extends React.Component<Props, State> {

    private _isMounted = false;

    private _timer: number | undefined = undefined;

    private _lastCloutTagPrefix = '';

    private _topCloutTags: CloutTag[] = [];

    private _focusSubscription: () => void;

    private _slideRight = new Animated.Value(1000)

    constructor(props: Props) {
        super(props);

        this.state = {
            isLoading: true,
            cloutTags: [],
            historyCloutTags: []
        };

        this.init = this.init.bind(this);
        this.clearCloutTagHistory = this.clearCloutTagHistory.bind(this);
        this._focusSubscription = this.props.navigation.addListener(
            'focus',
            () => {
                this.setSearchMethod();
                this.initHistoryCloutTags();
            }
        );

        this.initHistoryCloutTags();
        this.init();
    }

    componentDidMount(): void {
        this._isMounted = true;
    }

    componentWillUnmount(): void {
        this._isMounted = false;
        this._focusSubscription();
    }

    private setSearchMethod() {
        navigatorGlobals.searchResults = (p_cloutTagPrefix: string) => {
            p_cloutTagPrefix = p_cloutTagPrefix.trim();
            this._lastCloutTagPrefix = p_cloutTagPrefix;

            if (isNumber(this._timer)) {
                window.clearTimeout(this._timer);
            }

            if (!p_cloutTagPrefix) {
                this.setState({ cloutTags: this._topCloutTags, isLoading: false });
            }
            else {
                if (this._isMounted) {
                    this.setState({ isLoading: true });
                }
                this._timer = window.setTimeout(
                    () => {
                        cloutApi.searchCloutTags(p_cloutTagPrefix).then(
                            response => {
                                if (this._isMounted && this._lastCloutTagPrefix === p_cloutTagPrefix) {
                                    this.setState({ cloutTags: response, isLoading: false });
                                }
                            }
                        ).catch(error => globals.defaultHandleError(error));
                    },
                    500
                );
            }
        };
    }

    private async initHistoryCloutTags(): Promise<void> {
        const key = `${globals.user.publicKey}_${constants.localStorage_searchHistoryCloutTags}`;
        try {
            const searchHistoryCloutTags = await AsyncStorage.getItem(key);
            if (this._isMounted && searchHistoryCloutTags) {
                const historyCloutTags = JSON.parse(searchHistoryCloutTags);
                Animated.timing(
                    this._slideRight,
                    {
                        toValue: 0,
                        duration: 500,
                        useNativeDriver: true,
                    }
                ).start(),
                    this.setState({ historyCloutTags });
            }
        } catch { }
    }

    private async init(): Promise<void> {
        try {
            const response = await cloutApi.getTrendingClouts(20);
            if (this._isMounted) {
                this._topCloutTags = response;
                this.setState({ cloutTags: response, isLoading: false });
            }
        } catch (error) {
            globals.defaultHandleError(error);
        }
    }

    private async clearCloutTagHistory(): Promise<void> {
        try {
            const key = `${globals.user.publicKey}_${constants.localStorage_searchHistoryCloutTags}`;
            await AsyncStorage.removeItem(key);
            this.setState({ historyCloutTags: [] });
        } catch { }
    }

    render(): JSX.Element {

        if (this._lastCloutTagPrefix) {
            Animated.timing(
                this._slideRight,
                {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }
            ).start();
        }

        const renderHeader = (): JSX.Element => this.state.historyCloutTags.length > 0 && !this._lastCloutTagPrefix ? <Animated.View style={{ transform: [{ translateX: this._slideRight }] }}>
            <CloutTagHistoryCardComponentComponent
                navigation={this.props.navigation}
                clearCloutTagHistory={this.clearCloutTagHistory}
                cloutTags={this.state.historyCloutTags}
            />
            <Text style={[styles.historyTitle, themeStyles.fontColorMain, { marginBottom: 10 }]}>Top CloutTags</Text>
        </Animated.View> :
            <></>;

        const keyExtractor = (item: CloutTag, index: number): string => `${item.clouttag}_${index}`;
        const renderItem = (item: CloutTag): JSX.Element =>
            <CloutTagListCardComponent
                navigation={this.props.navigation}
                cloutTag={item} />;

        return this.state.isLoading ?
            <CloutFeedLoader /> :
            <View style={[styles.container, themeStyles.containerColorMain]}>
                {
                    this.state.cloutTags.length !== 0 ?
                        <FlatList
                            ListHeaderComponent={renderHeader}
                            data={this.state.cloutTags}
                            renderItem={({ item }) => renderItem(item)}
                            keyExtractor={keyExtractor}
                        /> :
                        <Text style={[themeStyles.fontColorSub, styles.noResults]}>No results found</Text>
                }
            </View>;
    }
}

const styles = StyleSheet.create(
    {
        container: {
            flex: 1
        },
        noResults: {
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
