import { themeStyles } from '@styles/globalColors';
import React from 'react';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CloutTag } from '@types';
import { ParamListBase } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { updateCloutTagHistory } from '../services/searchHistoryHelpers';

interface Props {
    cloutTag: CloutTag;
    navigation: StackNavigationProp<ParamListBase>;
}

export default class CloutTagListCardComponent extends React.Component<Props> {

    constructor(props: Props) {
        super(props);

        this.goToCloutTag = this.goToCloutTag.bind(this);
    }

    shouldComponentUpdate(p_nextProps: Props): boolean {
        return this.props.cloutTag !== p_nextProps.cloutTag;
    }

    private goToCloutTag(): void {
        updateCloutTagHistory(this.props.cloutTag.clouttag);
        this.props.navigation.navigate('CloutTagPosts', { cloutTag: this.props.cloutTag.clouttag });
    }

    render(): JSX.Element {
        return <TouchableOpacity
            style={[styles.container]}
            activeOpacity={0.7}
            onPress={this.goToCloutTag}>
            <View style={[styles.cloutTagContainer, themeStyles.lightBorderColor]}>
                <Feather name="hash" size={22} color={themeStyles.fontColorMain.color} />
            </View>
            <View>
                <Text style={[styles.cloutTag, themeStyles.fontColorMain]}>#{this.props.cloutTag.clouttag}</Text>
                <Text style={[themeStyles.fontColorSub, styles.count]}>{this.props.cloutTag.count} posts</Text>
            </View>
        </TouchableOpacity>;
    }
}

const styles = StyleSheet.create(
    {
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
            paddingVertical: 10
        },
        cloutTagContainer: {
            borderWidth: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 15,
            width: 55,
            height: 55,
            borderRadius: 50,
        },
        cloutTag: {
            fontSize: 15,
            fontWeight: '700'
        },
        count: {
            fontSize: 13,
        }
    }
);
