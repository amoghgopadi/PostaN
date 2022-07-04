import { createStackNavigator } from '@react-navigation/stack';
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { eventManager } from '@globals';
import { themeStyles } from '@styles';
import { HomeScreen } from '@screens/home/home.screen';
import { LogoHeaderComponent } from '@components/logoHeader.component';
import { stackConfig } from './stackNavigationConfig';
import { EventType } from '@types';
import { SharedStackScreens } from './sharedStackScreens';
import { NotificationsHeaderComponent } from '@screens/notifications/components/notificationsHeader.component';
import { NotificationsScreen } from '@screens/notifications/notifications.screen';
import { backgroundColor, iconColors } from '../common/values/colors';
import { radius } from '../common/values/dimens';

const HomeStack = createStackNavigator();

export default function HomeStackScreen(): JSX.Element {

    const [hasBadge, setHasBadge] = useState<boolean>(false);

    const isMounted = useRef<boolean>(true);

    useEffect(
        () => {
            const unsubscribeLastNotificationIndex = eventManager.addEventListener(
                EventType.RefreshNotifications,
                (newLastSeenIndex: number) => {
                    if (isMounted) {
                        if (newLastSeenIndex > 0) {
                            setHasBadge(true);
                        } else {
                            setHasBadge(false);
                        }
                    }
                }
            );

            
            return () => {
                isMounted.current = false;
                unsubscribeLastNotificationIndex();
            };
        },
        []
    );

    return (
        <HomeStack.Navigator
            screenOptions={({ navigation }: any) => ({
                ...stackConfig,
                headerTitleStyle: {
                    alignSelf: 'center',
                    marginRight: Platform.OS === 'ios' ? 0 : 50,
                    color: themeStyles.fontColorMain.color
                },
                headerStyle: {
                    backgroundColor:'white',// backgroundColor.commonScreenBackground,
                    shadowOpacity: 0,
                    elevation: 0,
                    borderBottomLeftRadius: radius.headerRadius,
                    borderBottomRightRadius: radius.headerRadius
                },
                headerLeft: () => <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={1}>
                    <Ionicons name="chevron-back-circle-outline" size={32} color={iconColors.clickableIcons} />
                </TouchableOpacity>
            })}>
            <HomeStack.Screen
                options={
                    ({ navigation }) => ({
                        headerTitle: ' ',
                        headerBackTitle: ' ',
                        headerLeft: () => <LogoHeaderComponent></LogoHeaderComponent>,
                        headerRight: () => (
                            <View style={{ flexDirection: 'row' }}>
                                <TouchableOpacity
                                    style={styles.headerIcon}
                                    onPress={() => navigation.navigate('Notifications')}
                                >
                                    <>
                                        <Ionicons name="md-notifications-outline" size={27} color={themeStyles.fontColorMain.color} />
                                        {
                                            hasBadge && <View style={styles.notificationBadge} />
                                       }
                                    </>
                                </TouchableOpacity>
                                
                            </View>
                        ),
                    })
                }
                name="Home"
                component={HomeScreen}
            />

            <HomeStack.Screen
                options={
                    {
                        headerTitleStyle: {
                            alignSelf: 'center',
                            color: themeStyles.fontColorMain.color
                        },
                        headerBackTitle: ' ',
                        headerRight: () => <NotificationsHeaderComponent />
                    }
                }
                name="Notifications"
                component={NotificationsScreen}
            />

            {
                SharedStackScreens.map((item: any, index: number) => <HomeStack.Screen
                    key={`${item.name as string}_${index}`}
                    options={item.options}
                    name={item.name}
                    component={item.component}
                />
                )
            }

        </HomeStack.Navigator>
    );
}

const styles = StyleSheet.create(
    {
        
        
        notificationBadge: {
            width: 6,
            height: 6,
            backgroundColor: '#eb1b0c',
            position: 'absolute',
            left: 22,
            top: 0,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 9
        },
        headerIcon: {
            marginRight: 16,
            paddingHorizontal: 4
        }
    }
);
