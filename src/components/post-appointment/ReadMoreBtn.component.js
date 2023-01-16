import React, { Component } from "react";
import { StyleSheet} from "react-native";
import { Button, Text} from "native-base";
import { Colors, TextStyles } from 'ch-mobile-shared';
import FeatherIcons from 'react-native-vector-icons/Feather';

export class ReadMoreBtn extends Component<Props> {

    render() {
        return (
            <Button
                onPress={this.props.onPress}
                style={styles.readMorebtn}
                transparent>
                <Text uppercase={false} style={styles.readMoreText}>Read more</Text>
                <FeatherIcons size={20} color={Colors.colors.primaryText} name="arrow-right"/>
            </Button>

        );
    }
}
const styles = StyleSheet.create({
    readMorebtn: {
        paddingLeft: 0,
        marginLeft: 0,
        width: 110
    },
    readMoreText: {
        paddingLeft: 0,
        paddingRight: 8,
        color: Colors.colors.primaryText,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.linkTextM,
    }
});
