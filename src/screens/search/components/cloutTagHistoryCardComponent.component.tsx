import React from 'react';
import { Text, StyleSheet, TouchableOpacity, FlatList, View } from 'react-native';
import { updateCloutTagHistory } from '../services/searchHistoryHelpers';
import { StackNavigationProp } from '@react-navigation/stack';
import { ParamListBase } from '@react-navigation/routers';
import { snackbar } from '@services/snackbar';
import { colors } from '../styles';
import SearchHistoryHeaderComponent from './searchHistoryHeader.component';
// This is need to prevent keyboard bug when trying to scroll and the keyboard is open
import { TouchableOpacity as TouchableOpacityGesture } from 'react-native-gesture-handler';

interface Props {
    navigation: StackNavigationProp<ParamListBase>;
    cloutTags: string[];
    clearCloutTagHistory: () => Promise<void>;
}

interface State {
    cloutTagsHistory: string[];
    isClearHistoryLoading: boolean;
}

export default class CloutTagHistoryCardComponentComponent extends React.Component<Props, State> {

    private _isMounted = false;

    constructor(props: Props) {
        super(props);

        this.state = {
            cloutTagsHistory: this.props.cloutTags,
            isClearHistoryLoading: false,
        };

        this.clearSearchHistory = this.clearSearchHistory.bind(this);
    }

    componentDidMount(): void {
        this._isMounted = true;
    }

    componentWillUnmount(): void {
        this._isMounted = false;
    }

    shouldComponentUpdate(prevProps: Props): boolean {
        return prevProps.cloutTags.length !== this.props.cloutTags.length;
    }

    private async clearSearchHistory() {
        this.setState({ isClearHistoryLoading: true });
        await this.props.clearCloutTagHistory();

        snackbar.showSnackBar({ text: 'History cleared successfully' });

        if (this._isMounted) {
            this.setState({ cloutTagsHistory: [], isClearHistoryLoading: false });
        }
    }

    private goToCloutTag(cloutTag: string): void {
        this.props.navigation.navigate(
            'CloutTagPosts',
            {
                cloutTag: cloutTag
            }
        );
        updateCloutTagHistory(cloutTag);
    }

    render(): JSX.Element {

        const keyExtractor = (item: string, index: number): string => `${item}_${index.toString()}`;
        const renderItem = ({ item, index }: { item: string, index: number }): JSX.Element => <TouchableOpacity
            activeOpacity={1}
            onPress={() => this.goToCloutTag(item)}
            style={[styles.container, { backgroundColor: colors[index] }]}>
            <Text style={[styles.cloutTag]}>#{item}</Text>
        </TouchableOpacity>;

        return <View>
            <SearchHistoryHeaderComponent
                isClearHistoryLoading={this.state.isClearHistoryLoading}
                clearSearchHistory={this.clearSearchHistory} />

            <TouchableOpacityGesture>
                <FlatList
                    horizontal
                    bounces={false}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.flatListStyle}
                    data={this.state.cloutTagsHistory}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                />
            </TouchableOpacityGesture>
        </View>;
    }
}

const styles = StyleSheet.create(
    {
        flatListStyle: {
            marginVertical: 15,
            paddingHorizontal: 10
        },
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
            marginHorizontal: 4,
            paddingHorizontal: 15,
            borderRadius: 50,
        },
        cloutTag: {
            fontSize: 13,
            color: 'white',
            fontWeight: 'bold'
        },
    }
);
