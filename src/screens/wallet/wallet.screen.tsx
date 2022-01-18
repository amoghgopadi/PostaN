import React from 'react';
import { View, StyleSheet, RefreshControl, Text, ScrollView, SectionList, Linking } from 'react-native';
import { globals } from '@globals/globals';
import { themeStyles } from '@styles/globalColors';
import { calculateAndFormatDeSoInUsd, calculateDeSoInUSD } from '@services/deSoCalculator';
import { CoinEntry, CreatorCoinHODLer, User, WalletTab } from '@types';
import { TabConfig, TabsComponent } from '@components/tabs.component';
import { CreatorCoinHODLerComponent } from '@components/creatorCoinHODLer.component';
import { formatNumber } from '@services/helpers';
import { navigatorGlobals } from '@globals/navigatorGlobals';
import CloutFeedLoader from '@components/loader/cloutFeedLoader.component';
import { api, cache } from '@services';
import { RouteProp } from '@react-navigation/native';

interface Section {
    header: boolean;
    data: CreatorCoinHODLer[] | null[];
    renderItem: (({ item }: { item: CreatorCoinHODLer }) => JSX.Element) | undefined;
}

interface State {
    isLoading: boolean;
    publicKey: string;
    deSoPriceUsd: string;
    balanceDeSo: string;
    balanceUsd: string;
    creatorCoinsTotalValueUsd: string;
    selectedTab: WalletTab;
    usersYouHODL: CreatorCoinHODLer[];
    sections: Section[];
    refreshing: boolean;
}

type RouteParams = {
    Wallet: {
        publicKey: string;
    }
};

interface Props {
    route: RouteProp<RouteParams, 'Wallet'>;
}

export class WalletScreen extends React.Component<Props, State> {

    private _sectionListRef: SectionList<CreatorCoinHODLer, Section> | null = null;

    private readonly tabs: TabConfig[] = [
        {
            name: WalletTab.Purchased
        },
        {
            name: WalletTab.Received
        }
    ]

    private _isMounted = false;

    constructor(props: Props) {
        super(props);

        this.state = {
            isLoading: true,
            publicKey: '',
            deSoPriceUsd: '',
            balanceDeSo: '',
            balanceUsd: '',
            creatorCoinsTotalValueUsd: '',
            selectedTab: WalletTab.Purchased,
            usersYouHODL: [],
            sections: [],
            refreshing: false
        };

        this.loadData();
        this.loadData = this.loadData.bind(this);
        this.onTabClick = this.onTabClick.bind(this);

        navigatorGlobals.refreshWallet = () => {
            if (this._sectionListRef) {
                this._sectionListRef?.scrollToLocation(
                    {
                        sectionIndex: 0,
                        itemIndex: 0,
                        animated: true,
                        viewPosition: 0
                    }
                );
            }
        };
    }

    componentDidMount(): void {
        this._isMounted = true;
    }

    componentWillUnmount(): void {
        this._isMounted = false;
    }

    shouldComponentUpdate(_nextProps: Props, nextSate: State): boolean {
        return nextSate.isLoading !== this.state.isLoading ||
            nextSate.selectedTab !== this.state.selectedTab;
    }

    private loadData() {
        if (this._isMounted) {
            this.setState({ isLoading: true });
        }

        const publicKey: string = this.props.route.params?.publicKey ?
            this.props.route.params.publicKey
            : globals.user.publicKey;
        Promise.all(
            [
                cache.exchangeRate.getData(true),
                api.getProfile([publicKey])
            ]
        ).then(
            responses => {
                const user: User = responses[1].UserList[0];
                const deSoNanos = 1000000000.0;
                const balanceDeSo = (user.BalanceNanos / deSoNanos).toFixed(5);
                const deSoPriceUsd = calculateAndFormatDeSoInUsd(deSoNanos);
                const balanceUsd = calculateAndFormatDeSoInUsd(user.BalanceNanos);

                const usersYouHODL = user.UsersYouHODL;

                let creatorCoinsTotalValueUsd = 0;

                if (usersYouHODL?.length > 0) {
                    const amountUsdMap: { [key: string]: number } = {};
                    for (let i = 0; i < usersYouHODL.length; i++) {
                        if (usersYouHODL[i].ProfileEntryResponse) {
                            const userYouHODL = usersYouHODL[i];
                            const amountYouGetIfYouSold = this.deSoNanosYouWouldGetIfYouSold(
                                userYouHODL.BalanceNanos,
                                userYouHODL.ProfileEntryResponse.CoinEntry
                            );
                            const amountUsd = calculateDeSoInUSD(amountYouGetIfYouSold);

                            const coinsAmount = userYouHODL.BalanceNanos / 1000000000;
                            userYouHODL.ProfileEntryResponse.CoinPriceUSD = amountUsd / coinsAmount;

                            creatorCoinsTotalValueUsd += amountUsd;
                            amountUsdMap[userYouHODL.CreatorPublicKeyBase58Check] = amountUsd;
                        }
                    }

                    usersYouHODL.sort(
                        (p_user1, p_user2) => amountUsdMap[p_user1.CreatorPublicKeyBase58Check] > amountUsdMap[p_user2.CreatorPublicKeyBase58Check] ? -1 : 1
                    );
                }

                if (this._isMounted) {
                    this.setState(
                        {
                            isLoading: false,
                            deSoPriceUsd,
                            balanceDeSo,
                            balanceUsd,
                            creatorCoinsTotalValueUsd: formatNumber(creatorCoinsTotalValueUsd),
                            usersYouHODL: usersYouHODL,
                            refreshing: false,
                            sections: this.getSections(usersYouHODL, this.state.selectedTab === WalletTab.Purchased)
                        }
                    );
                }
            }
        );
    }

    private deSoNanosYouWouldGetIfYouSold(creatorCoinAmountNano: number, coinEntry: CoinEntry): number {
        const deSoLockedNanos = coinEntry.DeSoLockedNanos;
        const currentCreatorCoinSupply = coinEntry.CoinsInCirculationNanos;

        const deSoBeforeFeesNanos =
            deSoLockedNanos *
            (
                1 -
                Math.pow(
                    1 - creatorCoinAmountNano / currentCreatorCoinSupply,
                    1 / 0.3333333
                )
            );

        return (
            (deSoBeforeFeesNanos * (100 * 100 - 1)) / (100 * 100)
        );
    }

    private getSections(p_usersYouHODL: CreatorCoinHODLer[], p_purchased: boolean): Section[] {
        const sections: Section[] = [
            {
                header: true,
                data: [null],
                renderItem: undefined
            }
        ];

        const filteredUsersYouHODL = this.filterUsersYouHODL(p_usersYouHODL, p_purchased);
        if (filteredUsersYouHODL?.length > 0) {
            sections.push(
                {
                    header: false,
                    data: filteredUsersYouHODL,
                    renderItem: ({ item }: { item: CreatorCoinHODLer }) => <CreatorCoinHODLerComponent
                        isHolder={false}
                        creatorCoinPrice={item.ProfileEntryResponse?.CoinPriceUSD}
                        userWhoHODL={item} />
                }
            );
        } else {
            sections.push(
                {
                    header: false,
                    data: [null],
                    renderItem: () => <Text style={[styles.noCoinsText, themeStyles.fontColorSub]}>
                        You have not {p_purchased ? 'purchased' : 'received'} any creator coins yet.
                    </Text>
                }
            );
        }

        return sections;
    }

    filterUsersYouHODL(p_usersYouHODL: CreatorCoinHODLer[], p_purchased: boolean) {
        return p_usersYouHODL?.filter(
            p_userYouHODL => p_userYouHODL.HasPurchased === p_purchased ||
                (p_purchased && p_userYouHODL.CreatorPublicKeyBase58Check === p_userYouHODL.HODLerPublicKeyBase58Check)
        );
    }

    onTabClick(selectedTab: string) {
        const sections = this.getSections(this.state.usersYouHODL, selectedTab === WalletTab.Purchased);

        if (this._sectionListRef) {
            this._sectionListRef.scrollToLocation({ sectionIndex: 1, itemIndex: 0, animated: true, viewPosition: 0.5 });
        }

        if (this._isMounted) {
            this.setState(
                {
                    selectedTab: selectedTab as WalletTab,
                    sections
                }
            );
        }
    }

    render() {

        return <View style={[styles.container, themeStyles.containerColorMain]}>
            {
                this.state.isLoading ?
                    <CloutFeedLoader />
                    :
                    <ScrollView
                        contentContainerStyle={styles.container}
                        refreshControl={
                            <RefreshControl
                                tintColor={themeStyles.fontColorMain.color}
                                titleColor={themeStyles.fontColorMain.color}
                                refreshing={this.state.refreshing}
                                onRefresh={() => this.loadData()}
                            />
                        }
                    >
                        <View style={[styles.balanceContainer, themeStyles.containerColorSub]}>
                            <Text style={[styles.balanceText, themeStyles.fontColorSub]}>Balance ≈ ₹{this.state.balanceUsd}</Text>
                            <Text style={[styles.balanceDeSo, themeStyles.fontColorMain]}>{this.state.balanceDeSo} $DESO</Text>
                        </View>

                        <View style={[styles.deSoPriceContainer]}>
                            <Text style={[styles.deSoPriceText, themeStyles.fontColorMain]}>1 $DESO</Text>
                            <Text style={[styles.deSoPriceText, themeStyles.fontColorMain]}>~₹{this.state.deSoPriceUsd}</Text>
                        </View>

                        <View style={[styles.infoMessageContainer, styles.container, themeStyles.containerColorSub]}>
                            <Text style={[styles.infoText, themeStyles.fontColorMain]}>DESO Exchange is still not available. We are doing our best to support it as soon as possible.</Text>
                            <Text style={[styles.infoText, themeStyles.fontColorMain]}>
                                Want to buy or sell DeSo?
                                <Text style={styles.supportText} onPress={() => Linking.openURL('mailto:hello@talkapp.in?subject=Exchange%20DESO&body=I%20would%20like%20to%20buy/sell%20DESO.')}> Contact Us</Text>
                            </Text>
                        </View>
                    </ScrollView>
            }
        </View>;
    }
}

const styles = StyleSheet.create(
    {
        container: {
            flex: 1,
            width: '100%'
        },
        deSoPriceContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: 10
        },
        deSoPriceText: {
            fontSize: 16,
            fontWeight: '600'
        },
        balanceContainer: {
            flex: 0,
            padding: 10
        },
        balanceText: {
            fontWeight: '600',
            fontSize: 20,
            marginBottom: 4
        },
        balanceDeSo: {
            fontSize: 30,
            fontWeight: '600'
        },
        balanceUsd: {
            fontWeight: '500'
        },
        creatorCoinsContainer: {
            marginTop: 4,
            padding: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        noCoinsText: {
            fontWeight: '500',
            paddingLeft: 10,
            paddingRight: 10,
            paddingTop: 10
        },
        supportText: {
            alignSelf: 'flex-end',
            fontWeight: 'bold',
            color: 'blue'
        },
        infoMessageContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 10
        },
        infoText: {
            textAlign: 'center'
        }
    }
);
