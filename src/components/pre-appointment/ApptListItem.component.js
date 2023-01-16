import React, { Component } from "react";
import {Image, StyleSheet, TouchableOpacity} from "react-native";
import {View, Text} from "native-base";
import {Colors, TextStyles, CommonStyles, getAvatar} from 'ch-mobile-shared';
import moment from "moment";

export class ApptListItem extends Component<Props> {

    render() {
        return (
                    <TouchableOpacity
                        key={this.props.key}
                        onPress={this.props.onPress}
                        style={styles.singleApptEntry}>

                        <Text style={styles.apptMainTitle}>{this.props.title}</Text>
                        {this.props.showPastAppointments &&
                        <View style={styles.contentWrapper}>
                            <Image
                                style={styles.patientImg}
                                resizeMode={'cover'}
                                source={{uri: getAvatar({profilePicture: this.props.providerImage})}}/>
                            <View style={styles.patientDetails}>
                                <Text style={styles.infoTitle}>{this.props.providerName}</Text>
                                <Text
                                    style={styles.infoContent}>{this.props.date ? 'Completed on ' + moment.utc(this.props.date).format('MMMM D, YYYY - h:mm a') : 'N/A'}</Text>
                            </View>
                        </View>
                        }


                        {this.props.showGroups &&
                        <View style={styles.contentWrapper}>
                            <Image
                                style={styles.patientImg}
                                resizeMode={'cover'}
                                source={{uri: getAvatar({profilePicture: this.props.providerImage})}}/>
                            <View style={styles.patientDetails}>
                                <Text style={styles.infoTitle}>{this.props.attendanceCount ? this.props.attendanceCount + ' sessions attended' : 'No sessions attended'}</Text>
                                <Text
                                    style={styles.infoContent}>{this.props.date ? 'Joined on ' + moment.utc(this.props.date).format('MMMM D, YYYY') : 'N/A'}</Text>
                            </View>
                        </View>
                        }

                    </TouchableOpacity>




        );
    }
}
const styles = StyleSheet.create({
    singleApptEntry: {
        ...CommonStyles.styles.shadowBox,
        padding: 24,
        marginBottom: 8,
        borderRadius: 12
    },
    apptMainTitle: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        marginBottom: 12
    },
    contentWrapper: {
        flexDirection: 'row'
    },
    patientImg: {
        width: 48,
        height: 48,
        borderRadius: 24
    },
    patientDetails: {
        paddingLeft: 12
    },
    infoTitle: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextS
    },
    infoContent: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText
    }
});
