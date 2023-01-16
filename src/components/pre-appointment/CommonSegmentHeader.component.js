import React, { Component } from "react";
import { StyleSheet} from "react-native";
import { Button, Text, Segment} from "native-base";
import {Colors, PrimaryButton, TextStyles} from 'ch-mobile-shared';

export class CommonSegmentHeader extends React.PureComponent {

    render() {
        return (
            <Segment style={styles.segmentWrap}>
                <Button
                    onPress={() => {this.props.switchTab('first')}}
                    style={styles.segmentBtn}
                    first active={this.props.activeTab === 'first' ? true : false} >
                    <Text style={styles.segmentBtnText}>{this.props.firstTabText}</Text>
                </Button>
                <Button
                    onPress={() => {this.props.switchTab('second')}}
                    style={styles.segmentBtn}
                    last active={this.props.activeTab === 'second' ? true : false} >
                    <Text style={styles.segmentBtnText}>{this.props.secondTabText}</Text>
                </Button>
            </Segment>

        );
    }
}
const styles = StyleSheet.create({


    segmentWrap: {
        backgroundColor: Colors.colors.highContrastBG,
        borderRadius: 10,
        padding: 4,
        height: 40,
        marginBottom: 32
    },
    segmentBtn: {
        flex: 0.5,
        alignItems: 'center',
        borderRadius: 8,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0
    },
    segmentBtnText: {
        textAlign: 'center',
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextS,
        width: '100%'
    }
});
