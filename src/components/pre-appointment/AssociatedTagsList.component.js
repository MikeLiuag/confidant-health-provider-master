    import React, {Component} from 'react';
    import { Content, Text, View } from 'native-base';
    import { isIphoneX, Colors, TextStyles} from 'ch-mobile-shared';
    import {FlatList, StyleSheet} from 'react-native';
    import {CommonReviewItem} from "./CommonReviewItem.component";
    import {DOMAIN_IMPORTANCE_COLORS} from "../../constants/CommonConstants";

   export class AssociatedTagsList extends Component<Props> {

        constructor(props) {
            super(props);
        }

        render() {

            return (
                <View>
                        {this.props.data.length > 0 ?
                            <View style={styles.tagsList}>
                                <FlatList
                                    data={this.props.data}
                                    renderItem={({item, index}) => {
                                        const subText = this.props.getRelatedToText(item);
                                        return (<CommonReviewItem
                                            onPress={() => {
                                                this.props.getPatientAssociatedTagDetails(item)
                                                //this.refs.modalDetailView.open()
                                            }}
                                            key={index}
                                            tagMetaData={item.tagMetaData}
                                            subText={subText}
                                            title={item.name}
                                            typeColor={DOMAIN_IMPORTANCE_COLORS[item.priority.name].textColor}
                                            typeText={item.priority.name}
                                            previousReports={item.preReports}
                                            interference={item.tagMetaData && item.tagMetaData.interferenceInLife!==undefined && (item.tagMetaData.interferenceInLife===true?'yes':'no') }
                                        />);
                                    }

                                    }
                                    keyExtractor={item => item.id}
                                />
                            </View>
                            :
                            <View style={styles.tagsList}>
                                <Text>Nothing to show</Text>
                            </View>
                        }
            </View>
            )
        }
    }



    const styles = StyleSheet.create({
        tagsList: {
            paddingLeft: 24,
            paddingRight: 24,
            paddingTop: 30,
            paddingBottom: 30
        },
        greBtn: {
            padding: 24,
            paddingBottom: isIphoneX() ? 36 : 24,
            backgroundColor: Colors.colors.white,
            borderTopRightRadius: 12,
            borderTopLeftRadius: 12
        },
        topInfo: {
            flexDirection: 'row',
            marginBottom: 8
        },
        typeText: {
            color: Colors.colors.secondaryText,
            ...TextStyles.mediaTexts.manropeBold,
            ...TextStyles.mediaTexts.captionText
        },
        dateText: {
            color: Colors.colors.lowContrast,
            ...TextStyles.mediaTexts.manropeMedium,
            ...TextStyles.mediaTexts.captionText,
            marginLeft: 8
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
        },
        aptContent: {
            paddingTop: 10
        },
        contentHead: {
            color: Colors.colors.highContrast,
            ...TextStyles.mediaTexts.serifProBold,
            ...TextStyles.mediaTexts.TextH4,
            marginBottom: 8,
            marginTop: 16
        },
        contentPara: {
            color: Colors.colors.highContrast,
            ...TextStyles.mediaTexts.manropeRegular,
            ...TextStyles.mediaTexts.bodyTextS,
            marginBottom: 8
        }
    });
