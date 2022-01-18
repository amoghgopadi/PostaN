import React from 'react';
import { eventManager } from '@globals/injector';
import { themeStyles } from '@styles/globalColors';
import { View, StyleSheet, FlatList, RefreshControl, ActivityIndicator, Text, SafeAreaView } from 'react-native';
import { ContactWithMessages, EventType, Message, MessageFilter, MessageSort, RefreshContactWithMessagesEvent, UpdateContactsWithMessagesEvent } from '@types';
import { MessageSettingsComponent } from './components/messageSettings';
import * as SecureStore from 'expo-secure-store';
import { constants } from '@globals/constants';
import { globals } from '@globals/globals';
import { api, getMessageText } from '@services';
import { getAnonymousProfile } from '@services';
import { ContactMessagesListCardComponent } from '@screens/messages/components/contactMessagesListCard.component';
import CloutFeedLoader from '@components/loader/cloutFeedLoader.component';
import { messagesService } from '@services/messagesServices';
import { StackNavigationProp } from '@react-navigation/stack';
import { ParamListBase } from '@react-navigation/routers';

interface Props {
    navigation: StackNavigationProp<ParamListBase>;
}

interface State {
    isLoading: boolean;
    isFilterShown: boolean;
    messagesFilter: MessageFilter[];
    messagesSort: MessageSort;
    contacts: ContactWithMessages[];
    refreshing: boolean;
    isLoadingMore: boolean;
    noMoreMessages: boolean;
}

export class MessagesScreen extends React.Component<Props, State>{

    private _isMounted = false;

    private _subscriptions: (() => void)[] = [];

    constructor(props: Props) {
        super(props);

        this.state = {
            isLoading: true,
            isFilterShown: false,
            messagesFilter: [],
            messagesSort: MessageSort.MostRecent,
            contacts: [],
            refreshing: false,
            isLoadingMore: false,
            noMoreMessages: false
        };

        messagesService.getMessageSettings().then(
            ({ messagesFilter, messagesSort }) => {
                this.loadMessages(messagesFilter, messagesSort);
                if (this._isMounted) {
                    this.setState({ messagesFilter, messagesSort });
                }
            }
        ).catch(() => { });

        this._subscriptions.push(
            eventManager.addEventListener(EventType.OpenMessagesSettings, this.toggleMessagesFilter.bind(this)),
            eventManager.addEventListener(EventType.UpdateContactsWithMessages, this.updateContacts.bind(this)),
            eventManager.addEventListener(EventType.RefreshContactsWithMessages, this.refreshContacts.bind(this))
        );

        this.loadMessages = this.loadMessages.bind(this);
        this.loadMoreMessages = this.loadMoreMessages.bind(this);
        this.onMessageSettingChange = this.onMessageSettingChange.bind(this);
        this.toggleMessagesFilter = this.toggleMessagesFilter.bind(this);
    }

    componentDidMount(): void {
        this._isMounted = true;
    }

    componentWillUnmount(): void {
        globals.dispatchRefreshMessagesEvent();

        for (const unsubscribe of this._subscriptions) {
            unsubscribe();
        }

        this._isMounted = false;
    }

    private refreshContacts(event: RefreshContactWithMessagesEvent) {
        const filteredContacts = this.state.contacts.filter((_contact: ContactWithMessages, index: number) => event.contactIndex !== index);
        if (this._isMounted) {
            this.setState({ contacts: [...filteredContacts] });
        }
    }

    private updateContacts(event: UpdateContactsWithMessagesEvent): void {
        const contacts = this.state.contacts;
        const lastMessage = event.message;

        let fromIndex = 0;
        let lastUpdated: ContactWithMessages | null = null;
        for (let i = 0; i < this.state.contacts.length; i++) {
            if (this.state.contacts[i].ProfileEntryResponse?.PublicKeyBase58Check === lastMessage?.RecipientPublicKeyBase58Check) {
                lastUpdated = contacts[i];
                contacts[i].Messages.push(lastMessage);
                contacts[i].LastDecryptedMessage = lastMessage.DecryptedText;
                fromIndex = i;
            }
        }

        if (lastUpdated) {
            contacts.splice(fromIndex, 1);
            contacts.splice(0, 0, lastUpdated);
        }
        if (this._isMounted) {
            this.setState({ contacts });
        }
    }

    private loadMessages(messageFilter: MessageFilter[], messageSort: MessageSort): void {
        if (this._isMounted && !this.state.isLoading) {
            this.setState({ isLoading: true });
        }

        messagesService.getMessagesCallback(messageFilter, 25, messageSort, '').then(
            async response => {
                const contacts = await this.processData(response);
                if (this._isMounted) {
                    this.setState(
                        {
                            contacts,
                            isLoading: false,
                            noMoreMessages: contacts.length < 25
                        }
                    );
                }
            }
        ).catch(() => { });
    }

    private loadMoreMessages(messageFilter: MessageFilter[], messageSort: MessageSort): void {
        if (this.state.isLoadingMore || !this.state.contacts || this.state.contacts.length === 0 || this.state.noMoreMessages) {
            return;
        }

        if (this._isMounted) {
            this.setState({ isLoadingMore: true });
        }

        const lastPublicKey = this.state.contacts[this.state.contacts.length - 1].PublicKeyBase58Check;

        messagesService.getMessagesCallback(messageFilter, 25, messageSort, lastPublicKey).then(
            async response => {
                const contacts = await this.processData(response);
                if (this._isMounted) {
                    this.setState(
                        {
                            contacts: this.state.contacts.concat(contacts),
                            isLoadingMore: false,
                            noMoreMessages: contacts.length < 25
                        }
                    );
                }
            }
        ).catch(() => { });
    }

    private async handleDecryptLastMessage(message: Message): Promise<string | undefined> {
        try {
            return await getMessageText(message);
        } catch { }
    }

    private async processData(response: any): Promise<ContactWithMessages[]> {
        const unreadStateByContact = response?.UnreadStateByContact ? response.UnreadStateByContact : {};
        const contactsWithMessages: ContactWithMessages[] = response?.OrderedContactsWithMessages ? response.OrderedContactsWithMessages : [];

        for (const contactWithMessages of contactsWithMessages) {
            if (!contactWithMessages.ProfileEntryResponse) {
                contactWithMessages.ProfileEntryResponse = getAnonymousProfile(contactWithMessages.PublicKeyBase58Check);
            } else {
                contactWithMessages.ProfileEntryResponse.ProfilePic = api.getSingleProfileImage(contactWithMessages.PublicKeyBase58Check);
            }
            try {
                const lastMessage = contactWithMessages.Messages[contactWithMessages.Messages.length - 1];
                const response = await this.handleDecryptLastMessage(lastMessage);
                contactWithMessages.LastDecryptedMessage = response;
                contactWithMessages.UnreadMessages = unreadStateByContact[contactWithMessages.PublicKeyBase58Check];
            } catch { }
        }
        return contactsWithMessages;
    }

    private toggleMessagesFilter(): void {
        if (this._isMounted) {
            this.setState({ isFilterShown: true });
        }
    }

    private async onMessageSettingChange(filter: MessageFilter[], sort: MessageSort) {

        try {
            const filterJson = JSON.stringify(filter);

            if (filterJson === JSON.stringify(this.state.messagesFilter) && sort === this.state.messagesSort) {
                this.setState({ isFilterShown: false });
                return;
            }

            const messageFilterKey = globals.user.publicKey + constants.localStorage_messagesFilter;
            await SecureStore.setItemAsync(messageFilterKey, filterJson);

            const messageSortKey = globals.user.publicKey + constants.localStorage_messagesSort;
            await SecureStore.setItemAsync(messageSortKey, sort);

            if (this._isMounted) {
                this.setState({ messagesFilter: filter, messagesSort: sort, isFilterShown: false });
                this.loadMessages(filter, sort);
            }
        } catch { undefined; }
    }

    render(): JSX.Element {

        const renderRefresh = <RefreshControl
            tintColor={themeStyles.fontColorMain.color}
            titleColor={themeStyles.fontColorMain.color}
            refreshing={this.state.refreshing}
            onRefresh={() => this.loadMessages(this.state.messagesFilter, this.state.messagesSort)}
        />;
        const keyExtractor = (item: ContactWithMessages, index: number): string => item.PublicKeyBase58Check + index.toString();
        const renderItem = ({ item, index }: { item: ContactWithMessages, index: number }): JSX.Element => <ContactMessagesListCardComponent index={index} contactWithMessages={item} />;
        const renderFooter = this.state.isLoadingMore ? <ActivityIndicator color={themeStyles.fontColorMain.color} /> : <></>;
        if (globals.readonly) {
            return <View style={[styles.infoMessageContainer, styles.container, themeStyles.containerColorSub]}>
                <Text style={[styles.infoText, themeStyles.fontColorMain]}>Messages are not available in the read-only mode.</Text>
            </View>;
        }

        if (globals.derived) {
            return <View style={[styles.infoMessageContainer, styles.container, themeStyles.containerColorSub]}>
                <Text style={[styles.infoText, themeStyles.fontColorMain]}>Messages are still not available. We are doing our best to support them as soon as possible.</Text>
            </View>;
        }

        return <SafeAreaView style={[styles.container, themeStyles.containerColorMain]}>
            {
                this.state.isLoading ?
                    <CloutFeedLoader />
                    :
                    globals.readonly ?
                        <View style={[styles.readOnlyText, styles.container, themeStyles.containerColorSub]}>
                            <Text style={themeStyles.fontColorMain}>Messages are not available in the read-only mode.</Text>
                        </View>
                        :
                        <View style={[styles.container, themeStyles.containerColorMain]}>
                            <FlatList
                                style={styles.flatListStyle}
                                data={this.state.contacts}
                                keyExtractor={keyExtractor}
                                renderItem={renderItem}
                                refreshControl={renderRefresh}
                                onEndReached={() => this.loadMoreMessages(this.state.messagesFilter, this.state.messagesSort)}
                                ListFooterComponent={renderFooter}
                            />
                        </View>
            }
            {
                this.state.isFilterShown &&
                <MessageSettingsComponent
                    filter={this.state.messagesFilter}
                    sort={this.state.messagesSort}
                    isFilterShown={this.state.isFilterShown}
                    onSettingsChange={(filter: MessageFilter[], sort: MessageSort) => this.onMessageSettingChange(filter, sort)}
                />
            }
        </SafeAreaView>;
    }
}

const styles = StyleSheet.create(
    {
        container: {
            flex: 1,
            width: '100%'
        },
        flatListStyle: {
            marginBottom: 20
        },
        infoMessageContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 10
        },
        infoText: {
            textAlign: 'center'
        },
        readOnlyText: {
            alignItems: 'center',
            justifyContent: 'center'
        }
    }
);
