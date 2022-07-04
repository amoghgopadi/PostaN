import React, { useEffect, useState, useRef, useContext } from 'react';
import { EmitterSubscription, Image, Keyboard, Platform, StyleSheet, View, SafeAreaView } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons, EvilIcons } from '@expo/vector-icons';
import { eventManager, globals, hapticsManager, navigatorGlobals, settingsGlobals } from '@globals';
import { themeStyles } from '@styles';
import { EventType, FocusSearchHeaderEvent } from '@types';
import HomeStackScreen from './homeStackNavigator';
import ProfileStackScreen from './profileStackNavigator';
import WalletStackScreen from './walletStackNavigator';
import { getFocusedRouteNameFromRoute } from '@react-navigation/core';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import SearchStackScreen from './searchStackNavigator';
import { UserContext } from '@globals/userContext';
import { backgroundColor, iconColors } from '../common/values/colors';

const Tab = createBottomTabNavigator();

const firstScreen: any = {
    HomeStack: 'Home',
    ProfileStack: 'Profile',
    WalletStack: 'Wallet',
    CreatePostStack: 'CreatePost',
    SearchStack: 'Search'
};

const TabElement = ({ tab, onPress, selectedTab }: any) => {

    const navigation = useNavigation<StackNavigationProp<ParamListBase>>();

    const { profilePic } = useContext(UserContext);

    let iconColor = iconColors.notSelectedIcon;
    let icon;

    if (selectedTab === tab.name) {
        iconColor = iconColors.selectedIcon;
    }

    if (tab.name === 'HomeStack') {
        icon = <MaterialCommunityIcons name="lightning-bolt-outline" size={28} color={iconColor} />;
    } else if (tab.name === 'WalletStack') {
        icon = <Ionicons name="wallet-outline" size={28} color={iconColor} />;
    } else if (tab.name === 'CreatePostStack') {
        icon = <Ionicons name="add-circle-outline" size={28} color={iconColor} />;
    } else if (tab.name === 'SearchStack') {
        icon = <Ionicons name="search-outline" size={28} color={iconColor} />;
    } else if (tab.name === 'ProfileStack') {
        icon = (!profilePic.startsWith('undefined') ? 
            <Image
              style={[
                styles.profileImage,
                {
                  borderWidth: selectedTab === tab.name ? 2 : 0,
                  borderColor: iconColor,
                },
              ]}
              source={{ uri: profilePic }}
            /> : <EvilIcons name="user" size={36} color={iconColor} />
          );
    }

    function openProfileManager() {
        if (tab.name === 'ProfileStack' && !globals.readonly) {
            eventManager.dispatchEvent(EventType.ToggleProfileManager, { visible: true, navigation: navigation });
            hapticsManager.customizedImpact();
        }
    }

    return (
        <TouchableOpacity
            style={{ padding: 6 }}
            onPress={onPress}
            onLongPress={openProfileManager}
        >
            {icon}
        </TouchableOpacity>
    );
};

const TabBar = ({ state }: any) => {

    const navigation = useNavigation<StackNavigationProp<ParamListBase>>();

    const [visible, setVisible] = useState(true);
    const [selectedTab, setSelectedTab] = useState('HomeStack');
    const { routes } = state;
    const { index } = state;
    const tabScreenNames = routes.map((route: any) => route.name);

    useEffect(() => {
        setSelectedTab(tabScreenNames[index]);
    }, [index]);

    useEffect(() => {
        let keyboardEventListeners: EmitterSubscription[];
        if (Platform.OS === 'android') {
            keyboardEventListeners = [
                Keyboard.addListener('keyboardDidShow', () => setVisible(false)),
                Keyboard.addListener('keyboardDidHide', () => setVisible(true)),
            ];
        }
        return () => {
            if (Platform.OS === 'android') {
                keyboardEventListeners &&
                    keyboardEventListeners.forEach((eventListener: EmitterSubscription) => eventListener.remove());
            }
        };
    }, []);

    function navigate(p_screenName: string) {
        const focusedRouteName = getFocusedRouteNameFromRoute(routes.find((route: any) => p_screenName === route.name));
        if (selectedTab === p_screenName) {
            if (selectedTab === 'HomeStack' && (focusedRouteName === 'Home' || focusedRouteName === undefined)) {
                navigatorGlobals.refreshHome();
            } else if (p_screenName === 'WalletStack' && (focusedRouteName === 'Wallet' || focusedRouteName === undefined)) {
                navigatorGlobals.refreshWallet();
            } else if (p_screenName === 'ProfileStack' && (focusedRouteName === 'Profile' || focusedRouteName === undefined)) {
                navigatorGlobals.refreshProfile();
            } else if (p_screenName === 'SearchStack' && (focusedRouteName === 'Search' || focusedRouteName === undefined)) {
                const event: FocusSearchHeaderEvent = {
                    focused: false
                };
                eventManager.dispatchEvent(EventType.FocusSearchHeader, event);
            } else {
                navigation.navigate(selectedTab, { screen: firstScreen[selectedTab] });
                if (p_screenName === 'SearchStack') {
                    const event: FocusSearchHeaderEvent = {
                        focused: false
                    };
                    eventManager.dispatchEvent(EventType.FocusSearchHeader, event);
                }
            }
        } else {
            if (p_screenName === "WalletStack") {
                navigatorGlobals.refreshWallet();
              }

            navigation.navigate(p_screenName);
        }
    }

    if (Platform.OS === 'android' && !visible) {
        return null;
    }
    return (
        <SafeAreaView style={themeStyles.containerColorMain}>
            <View style={[styles.tabsContainer, themeStyles.containerColorMain, { borderColor: settingsGlobals.darkMode ? '#141414' : '#f2f2f2' }]}>
                {
                    routes.slice(0, 2).map((p_route: any) => (
                        <TabElement
                            tab={p_route}
                            onPress={() => navigate(p_route.name)}
                            selectedTab={selectedTab}
                            key={p_route.key}>
                        </TabElement>
                    ))
                }
                <View>
                    <TouchableOpacity
                    
                    
                    onPress={() => navigation.push('TabNavigator', {
                        screen: 'HomeStack',
                        params: {
                            screen: 'CreatePost',
                            params: {
                                newPost: true,
                                key: 'NewPost'
                            }
                        }
                    })}>
                        <Ionicons
                         name="add-circle-outline" size={48} color={iconColors.notSelectedIcon} 
                         />
                    </TouchableOpacity>
                </View>
                {
                    routes.slice(2).map((p_route: any) => (
                        <TabElement
                            tab={p_route}
                            onPress={() => navigate(p_route.name)}
                            selectedTab={selectedTab}
                            key={p_route.key}
                            navigation={navigation}>
                        </TabElement>
                    ))
                }
            </View>
        </SafeAreaView>
    );
};

export function TabNavigator() {
    return (
        <Tab.Navigator
            sceneContainerStyle={{backgroundColor: backgroundColor.commonScreenBackground}}
            tabBar={props => <TabBar {...props} />}>
            <Tab.Screen name="HomeStack" component={HomeStackScreen} />
            <Tab.Screen name="SearchStack" component={SearchStackScreen} />
            <Tab.Screen name="WalletStack" component={WalletStackScreen} />
            <Tab.Screen name="ProfileStack" component={ProfileStackScreen} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create(
    {
        tabsContainer: {
            height: 50,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
        },
        profileImage: {
            width: 30,
            height: 30,
            borderRadius: 30,
        }
    }
);
