import React, { Component } from "react";
import {StyleSheet, TouchableOpacity} from "react-native";
import {Button, Text, View} from "native-base";
import {Colors, CommonStyles, TextStyles} from 'ch-mobile-shared';
import FeatherIcons from 'react-native-vector-icons/Feather';

export class SingleTagItem extends Component<Props> {

    render() {
        const ViewComponent = this.props.onPress?TouchableOpacity:View;
        return (
            <ViewComponent style={[styles.singleTag, { backgroundColor: this.props.bgColor }]} onPress={this.props.onPress}>
                <Text style={[styles.tagText, { color: this.props.textColor }]}>
                    {this.props.tagTitle}
                </Text>
            </ViewComponent>

        );
    }
}
const styles = StyleSheet.create({
    singleTag: {
        ...CommonStyles.styles.shadowBox,
        paddingHorizontal: 16,
        paddingVertical: 8,
        margin: 4,
        borderWidth: 1,
        borderRadius: 4
    },
    tagText: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeBold
    }
});
