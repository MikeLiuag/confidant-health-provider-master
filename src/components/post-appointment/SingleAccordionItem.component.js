import React, { Component } from "react";
import { StyleSheet } from "react-native";
import { ListItem, Text, CheckBox } from "native-base";
import {addTestID, Colors, TextStyles } from 'ch-mobile-shared';
// import {addTestID} from "../utilities";
// import {Colors, TextStyles } from "../styles";

export class SingleAccordionItem extends Component<Props> {
    render() {
        return (
            <ListItem
                {...addTestID(this.props.listTestId)}
                key={this.props.keyId}
                onPress={this.props.listPress}
                style={styles.multiList}
            >
                <Text
                    style={
                        this.props.itemSelected
                            ? styles.multiListTextSelected
                            : styles.multiListText
                    }>
                    {this.props.itemTitle}
                </Text>
                <CheckBox
                    {...addTestID(this.props.checkTestId)}
                    style={
                        this.props.itemSelected ? [styles.multiCheck, styles.multiCheckSelected] : styles.multiCheck
                    }
                    color={Colors.colors.mainBlue}
                    checked={this.props.itemSelected}
                    onPress={this.props.listPress}
                />
            </ListItem>
        );
    }
}
const styles = StyleSheet.create({
    multiList: {
        borderBottomWidth: 0,
        // borderColor: Colors.colors.mediumContrastBG,
        backgroundColor: Colors.colors.white,
        marginLeft: 0,
        paddingLeft: 24,
        paddingTop: 20,
        paddingBottom: 20,
        paddingRight: 16,
        // marginBottom: 8,
        borderRadius: 8
    },
    multiListText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.mediumContrast,
        paddingRight: 10,
        flex: 1
    },
    multiListTextSelected: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.primaryText,
        paddingRight: 10,
        flex: 1
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
        borderColor: Colors.colors.mainBlue,
        color: Colors.colors.mainBlue
    }
});
