import React, { Component } from "react";
import { StyleSheet } from "react-native";
import { ListItem, Text, CheckBox } from "native-base";
import {addTestID, Colors, TextStyles} from "ch-mobile-shared";

export class GreenCheckListItem extends Component<Props> {
    render() {
        return (
            <ListItem
                {...addTestID(this.props.listTestId)}
                key={this.props.keyId}
                onPress={this.props.listPress}
                style={
                    this.props.itemSelected
                        ? [styles.multiList, styles.multiListSelected]
                        : styles.multiList
                }
            >
                <Text
                    style={
                        this.props.itemSelected
                            ? [
                                styles.multiListText,
                                {
                                    color: Colors.colors.successText
                                },
                            ]
                            : styles.multiListText
                    }>
                    {this.props.itemTitle}
                </Text>
                <CheckBox
                    {...addTestID(this.props.checkTestId)}
                    style={
                        this.props.itemSelected ? [styles.multiCheck, styles.multiCheckSelected] : styles.multiCheck
                    }
                    color={Colors.colors.successText}
                    checked={this.props.itemSelected}
                    onPress={this.props.listPress}
                />
            </ListItem>
        );
    }
}
const styles = StyleSheet.create({
    multiList: {
        borderColor: Colors.colors.white,
        backgroundColor: Colors.colors.white,
        marginLeft: 0,
        paddingLeft: 16,
        paddingTop: 20,
        paddingBottom: 20,
        paddingRight: 16
    },
    multiListSelected: {
        //borderColor: Colors.colors.mainBlue40,
        backgroundColor: Colors.colors.successBG
    },
    multiListText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.highContrast,
        paddingRight: 10,
        flex: 1,
    },
    multiCheck: {
        width: 32,
        height: 32,
        borderWidth: 1,
        borderColor: Colors.colors.mediumContrastBG,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 4
    },
    multiCheckSelected: {
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: Colors.colors.successBG,
        color: Colors.colors.successText
    }
});
