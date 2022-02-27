import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { themeStyles } from '@styles';
import { backgroundColor, textColors } from '../common/values/colors';
import { heighAndWidth, radius, paddings } from '../common/values/dimens';
import TabText from '../common/texts/TabText';

export interface TabConfig {
    name: string;
}

interface Props {
    tabs: TabConfig[];
    selectedTab: string;
    onTabClick: (p_tabName: string) => void;
    centerText?: boolean;
}

export function TabsComponent({ tabs, selectedTab, onTabClick, centerText }: Props): JSX.Element {

    return <View style={[styles.container,
     {backgroundColor: backgroundColor.containerBackground,
        borderTopLeftRadius: radius.commonContainerRadius,
        borderTopRightRadius: radius.commonContainerRadius,
        justifyContent: 'space-between',
        paddingHorizontal: paddings.tabBarHorizontal,
     }]}>
        {
            tabs.map(
                p_tab => <TouchableOpacity
                    key={p_tab.name}
                    style={[
                        styles.tab,
                        selectedTab === p_tab.name ? { borderBottomWidth: 2, borderBottomColor: textColors.highlightedTabColor } : {},
                        centerText === true ? { alignItems: 'center', width: Dimensions.get('window').width / tabs.length } : {}
                    ]}
                    activeOpacity={1}
                    onPress={() => onTabClick(p_tab.name)}>
                    <TabText
                     isSelected={selectedTab === p_tab.name}
                     value={p_tab.name} />
                </TouchableOpacity>
            )
        }
    </View>;
}

const styles = StyleSheet.create(
    {
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            height: heighAndWidth.tabSwitcherHeight,
            width: '100%'
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
