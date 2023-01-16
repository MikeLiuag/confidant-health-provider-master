import React, { Component } from "react";
import {Image, StyleSheet, TouchableOpacity} from "react-native";
import {View, Text} from "native-base";
import { Colors, TextStyles, CommonStyles } from 'ch-mobile-shared';

export class CommonReviewItem extends Component<Props> {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <TouchableOpacity
                key={this.props.key}
                onPress={this.props.onPress}
                style={styles.singleSocialEntry}>
                <View style={styles.topInfo}>
                    <Text style={[styles.typeText, {textTransform: 'capitalize', color: this.props.typeColor}]}>{this.props.typeText}</Text>
                    <Text style={styles.dateText}>{this.props.dateText}</Text>
                    <Text style={styles.dateText}>{this.props.previousReports}</Text>

                </View>
                <Text style={styles.mainTitle}>{this.props.title}</Text>
                {
                    this.props.subText?
                        <Text style={styles.subText}>{this.props.subText}</Text> : null
                }

                {this.props.tagMetaData && this.props.tagMetaData.rxDrugInfo && Object.keys(this.props.tagMetaData.rxDrugInfo).length>0 &&
                    <Text style={styles.subText}>
                        {this.props.tagMetaData.rxDrugInfo.dose + ' '}
                        {this.props.tagMetaData.rxDrugInfo.doseUnit}
                        {this.props.tagMetaData.rxDrugInfo.doseFrequency === '1' ? ' once a day ' : ' twice daily '},
                        {this.props.tagMetaData.rxDrugInfo.supply ? this.props.tagMetaData.rxDrugInfo.supply+' days total' : '' }
                    </Text>
                }


                {
                    this.props.interference?
                        this.props.interference === 'yes'?
                            <View style={styles.interWrap}>
                                <Image
                                    style={styles.interIcon}
                                    source={require('../../assets/images/Interference.png')}  />
                                <Text style={styles.interText}>Interference with life</Text>
                            </View>
                            :
                            <View style={styles.interWrap}>
                                <Image
                                    style={styles.interIcon}
                                    source={require('../../assets/images/Interference-grey.png')}  />
                                <Text style={[styles.interText, { color: Colors.colors.lowContrast}]}>No interference with life</Text>
                            </View>
                        :
                        null
                }

            </TouchableOpacity>

        );
    }
}
const styles = StyleSheet.create({
    singleSocialEntry: {
        ...CommonStyles.styles.shadowBox,
        padding: 24,
        marginBottom: 8,
        borderRadius: 12
    },
    topInfo: {
        flexDirection: 'row',
        marginBottom: 8
    },
    typeText: {
        color: Colors.colors.primaryText,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.captionText
    },
    dateText: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText,
        marginLeft: 8
    },
    mainTitle: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast
    },
    subText: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.bodyTextS,
        marginTop: 4
    },
    interWrap: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    interIcon: {
        marginRight: 10
    },
    interText: {
        color: Colors.colors.secondaryText,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText
    },
});
