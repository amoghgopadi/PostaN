import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { themeStyles } from '@styles/globalColors';
import { NavigationHelpers, ParamListBase, TabNavigationState } from '@react-navigation/native';
import { MaterialTopTabNavigationEventMap } from '@react-navigation/material-top-tabs/lib/typescript/src/types';
import { backgroundColor, textColors } from '../common/values/colors';
import { heighAndWidth, radius, paddings } from '../common/values/dimens';
import TabText from '../common/texts/TabText';

interface Props {
    state: TabNavigationState<ParamListBase>;
    navigation: NavigationHelpers<ParamListBase, MaterialTopTabNavigationEventMap>;
}

export default function TopTabBarComponent({ state, navigation }: Props): JSX.Element {

    const onPress = (p_route: any, p_isFocused: boolean) => {

        const event = navigation.emit(
            {
                type: 'tabPress',
                target: p_route.key,
                canPreventDefault: true
            }
        );

        if (!p_isFocused && event.preventDefault) {
            navigation.navigate(p_route.name);
        }
    };

    // return <View style={[styles.container, themeStyles.containerColorMain]}>
    return <View style={[styles.container,
        {backgroundColor: backgroundColor.containerBackground,
           borderTopLeftRadius: radius.commonContainerRadius,
           borderTopRightRadius: radius.commonContainerRadius,
           justifyContent: 'space-between',
           paddingHorizontal: paddings.tabBarHorizontal,
        }]}>

        {
            state.routes.map(
                (route: any, index: number) => {
                    const isActive = state.index === index;
                    return (
                        <TouchableOpacity
                            key={index}
                            activeOpacity={1}
                            accessibilityState={isActive ? { selected: true } : {}}
                            onPress={() => onPress(route, state.index === index)}
                            style={[
                                styles.tab,
                                isActive ? { borderBottomWidth: 2, borderBottomColor: textColors.highlightedTabColor } : {},
                     //           centerText === true ? { alignItems: 'center', width: Dimensions.get('window').width / tabs.length } : {}
                            ]}
                      //      style={[styles.tab, isActive && [styles.activeTab, { borderBottomColor: themeStyles.fontColorMain.color }]]}
                        >
                             <TabText
                                isSelected={isActive}
                                value={route.name} 
                             />

                            {/* <Text style={isActive ? [themeStyles.fontColorMain, styles.selectedTabText] : [styles.tabText, themeStyles.fontColorSub]}>
                                {route.name}
                            </Text> */}
                        </TouchableOpacity>
                    );
                }
            )
        }
    </View>;
}

const styles = StyleSheet.create(
    {
        container: {
            flexDirection: 'row'
        },
        // tab: {
        //     flex: 1,
        //     justifyContent: 'center',
        //     alignItems: 'center',
        //     paddingVertical: 10
        // },
        activeTab: {
            borderBottomWidth: 2
        },
        notActiveTabText: {
            fontWeight: '500'
        },
        activeTabText: {
            fontWeight: 'bold'
        },

        tab: {
            height: 40,
            paddingLeft: 10,
            paddingRight: 10,
            justifyContent: 'center'
        },
        tabText: {
            fontWeight: '500',
            paddingTop: 10,
            fontSize: 15
        },
        selectedTabText: {
            fontWeight: 'bold',
        }
    }
);
