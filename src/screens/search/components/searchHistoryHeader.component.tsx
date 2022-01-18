import { themeStyles } from '@styles/globalColors';
import React from 'react';
import { Text, StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
    clearSearchHistory: () => Promise<void>;
    isClearHistoryLoading: boolean;
}

interface State {
    showClearText: boolean;
}

export default class SearchHistoryHeaderComponent extends React.Component<Props, State> {

    private _isMounted = false;

    constructor(props: Props) {
        super(props);

        this.state = {
            showClearText: false
        };

        this.toggleShowClearText = this.toggleShowClearText.bind(this);
        this.clearSearchHistory = this.clearSearchHistory.bind(this);
    }

    componentDidMount(): void {
        this._isMounted = true;
    }

    componentWillUnmount(): void {
        this._isMounted = false;
    }

    private toggleShowClearText(): void {
        this.setState({ showClearText: !this.state.showClearText });
    }

    private async clearSearchHistory() {
        await this.props.clearSearchHistory();
        if (this._isMounted) {
            this.setState({ showClearText: false });
        }
    }

    render(): JSX.Element {
        const clearBackgroundColor = themeStyles.verificationBadgeBackgroundColor.backgroundColor;

        return <View style={styles.headerRow}>
            <Text style={[styles.historyTitle, themeStyles.fontColorMain]}>Recent Searches</Text>
            {
                this.props.isClearHistoryLoading ?
                    <ActivityIndicator color={themeStyles.fontColorMain.color} size={'small'} /> :
                    this.state.showClearText ?
                        <View style={styles.row}>
                            <TouchableOpacity
                                activeOpacity={1}
                                onPress={this.toggleShowClearText}>
                                <Text style={[{ marginRight: 10 }, styles.clearText, themeStyles.fontColorMain]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={1}
                                onPress={this.clearSearchHistory}
                                style={[styles.clearButton, { backgroundColor: clearBackgroundColor }]}>
                                <Text style={styles.clearText}>Clear</Text>
                            </TouchableOpacity>
                        </View>
                        :
                        <TouchableOpacity onPress={this.toggleShowClearText} activeOpacity={1}>
                            <Ionicons name="close-circle-sharp" size={20} color={clearBackgroundColor} />
                        </TouchableOpacity>
            }
        </View>;
    }
}

const styles = StyleSheet.create(
    {
        historyTitle: {
            fontSize: 17,
            fontWeight: 'bold',
            paddingLeft: 10
        },
        headerRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingRight: 10,
            paddingTop: 10,
            height: 30
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center'
        },
        clearText: {
            fontSize: 10,
            color: 'white',
        },
        clearButton: {
            width: 40,
            height: 20,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center'
        },
    }
);
