import React, { Component } from "react";
import {StatusBar, StyleSheet} from "react-native";
import { Header, Left, Button, Body, Right, Title } from "native-base";
import { Colors, TextStyles, CommonStyles, getHeaderHeight } from 'ch-mobile-shared';
import EntypoIcons from 'react-native-vector-icons/Entypo';
const HEADER_SIZE = getHeaderHeight();

export class PreApptHeader extends Component<Props> {

    render() {
        return (
            <Header transparent noShadow={false}
                style={styles.headerWrap}>
                <StatusBar
                    backgroundColor="transparent"
                    barStyle="dark-content"
                    translucent
                />
                <Left>
                    <Button
                        onPress={this.props.onPress}
                        transparent
                        style={styles.backButton}>
                        <EntypoIcons size={30} color={Colors.colors.mainBlue} name="chevron-thin-left"/>
                    </Button>
                </Left>
                <Body style={styles.bodyWrap}>
                    <Title style={styles.headerTitle}>{this.props.headerText}</Title>
                </Body>
                <Right />
            </Header>

        );
    }
}
const styles = StyleSheet.create({
    headerWrap: {
        paddingLeft: 18,
        paddingRight: 18,
        height: HEADER_SIZE,
        ...CommonStyles.styles.headerShadow
    },
    backButton: {
        width: 35,
        paddingLeft: 0,
        paddingRight: 0
    },
    bodyWrap: {
        flex: 4,
        justifyContent: 'center',
        flexDirection: 'row'
    },
    headerTitle: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.highContrast,
        textAlign: 'center',
        flex: 1
    }
});
