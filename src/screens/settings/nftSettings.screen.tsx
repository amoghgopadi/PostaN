import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { SelectListControl } from '@controls/selectList.control';
import { themeStyles } from '@styles/globalColors';
import { HiddenNFTType } from '@types';
import { globals } from '@globals/globals';
import { eventManager } from '@globals/injector';
import { constants } from '@globals/constants';
import * as SecureStore from 'expo-secure-store';
import { ToggleHideNFTsEvent, EventType } from '@types';

interface Props {

}

interface State {
    hiddenNFTType: HiddenNFTType;
    areNFTsHidden: boolean;
}

export default class NFTSettingsScreen extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            hiddenNFTType: HiddenNFTType.Details,
            areNFTsHidden: false,
        };
        this.toggleHideNFTOption = this.toggleHideNFTOption.bind(this);
    }

    private onHiddenNFTTypeChange(type: HiddenNFTType): void {
        this.setState({ hiddenNFTType: type });
        const newValue = this.state.areNFTsHidden;

        globals.hiddenNFTType = type;
        const event: ToggleHideNFTsEvent = { hidden: newValue, type };
        eventManager.dispatchEvent(EventType.ToggleHideNFTs, event);

        const key = globals.user.publicKey + constants.localStorage_hiddenNFTType;
        SecureStore.setItemAsync(key, String(type)).catch(() => undefined);
    }

    private toggleHideNFTOption(): void {
        const newValue = !this.state.areNFTsHidden;
        this.setState({ areNFTsHidden: newValue });

        let type = this.state.hiddenNFTType;
        if (this.state.areNFTsHidden) {
            type = HiddenNFTType.None;
        } else {
            type = HiddenNFTType.Details;
            this.setState({ hiddenNFTType: type });
        }
        globals.areNFTsHidden = newValue;
        globals.hiddenNFTType = type;

        const event: ToggleHideNFTsEvent = { hidden: newValue, type };
        eventManager.dispatchEvent(EventType.ToggleHideNFTs, event);

        const typeKey = globals.user.publicKey + constants.localStorage_hiddenNFTType;
        SecureStore.setItemAsync(typeKey, String(type)).catch(() => undefined);

        const key = globals.user.publicKey + constants.localStorage_nftsHidden;
        SecureStore.setItemAsync(key, String(newValue)).catch(() => undefined);
    }

    render(): JSX.Element {
        return <View style={[styles.container, themeStyles.containerColorMain]}>
            <View style={[styles.cloutCastFeedSettingsContainer, themeStyles.borderColor]}>
                <Text style={[styles.cloutCastFeedSettingsText, themeStyles.fontColorMain]}>Hide NFTs</Text>
                <Switch
                    trackColor={{ false: themeStyles.switchColor.color, true: '#007ef5' }}
                    thumbColor={'white'}
                    ios_backgroundColor={themeStyles.switchColor.color}
                    onValueChange={this.toggleHideNFTOption}
                    value={this.state.areNFTsHidden}
                />
            </View>
            {
                this.state.areNFTsHidden &&
                <SelectListControl
                    style={[styles.selectList, themeStyles.borderColor]}
                    options={[
                        {
                            name: 'Only hide NFT details',
                            value: HiddenNFTType.Details
                        },
                        {

                            name: 'Hide posts completely',
                            value: HiddenNFTType.Posts
                        },
                    ]}
                    value={this.state.hiddenNFTType}
                    onValueChange={(value: string | string[]) => this.onHiddenNFTTypeChange(value as HiddenNFTType)}
                />
            }
        </View>;
    }
}

const styles = StyleSheet.create(
    {
        container: {
            flex: 1,
        },
        selectList: {
            borderBottomWidth: 1
        },
        cloutCastFeedSettingsContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 15,
            borderBottomWidth: 1
        },
        cloutCastFeedSettingsText: {
            fontWeight: '600',
            fontSize: 16
        },
    }
);
