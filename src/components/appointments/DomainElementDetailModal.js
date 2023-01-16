import React, {useState} from 'react';
import {
    addTestID,
    Colors,
    CommonSegmentHeader,
    CommonStyles,
    getAvatar,
    isIphoneX,
    PrimaryButton,
    TextStyles
} from "ch-mobile-shared";
import {Content, Text, View} from "native-base";
import {DOMAIN_IMPORTANCE_COLORS} from "../../constants/CommonConstants";
import {Image, StyleSheet} from "react-native";
import moment from "moment";
import Modal from "react-native-modalbox";

export function DomainElementDetailModal(props) {

    const [activeTab, setActiveTab] = useState('information');
    const {selectedTag, onClose, segments, visible,lookupData, actionable,
        resolveAssociation, updateAssociation, associationId} = props;
    const getRelatedToText = (item) => {
        let subText = null;
        if (item.tagMetaData && item.tagMetaData.specification) {
            if (isRelatedTo('relatedToMedicalCondition', item)) {
                subText = appendSubText('Related To Medical Condition', subText);
            }
            if (isRelatedTo('relatedToMedication', item)) {
                subText = appendSubText('Related To Medication', subText);
            }
            if (isRelatedTo('relatedToSubstanceUse', item)) {
                subText = appendSubText('Related To Substance Use', subText);
            }
            if (isRelatedTo('relatedToWithdrawal', item)) {
                subText = appendSubText('Related To Withdrawal', subText);
            }
        }
        return subText;
    }

    const isRelatedTo = (key, item) => {
        return item.tagMetaData.specification[key] && item.tagMetaData.specification[key].length > 0;
    };

    const appendSubText = (text, subText) => {
        if (!subText) {
            return text;
        }
        if (subText.length > 0) {
            subText = subText + '\n';
        }
        return subText + text;
    };

    const hasKeys = (object) => {
        return object && Object.keys(object).length > 0;
    };

    const renderDrugInfo = () => {
        if (selectedTag.tagMetaData && selectedTag.tagMetaData.rxDrugInfo && selectedTag.tagMetaData.rxDrugInfo.dose) {
            return <View style={styles.medicineBox}>
                <View style={styles.singleMedicine}>
                    <Text style={styles.mediMainText}>
                        {`${selectedTag.tagMetaData.rxDrugInfo.dose} ${selectedTag.tagMetaData.rxDrugInfo.doseUnit}`}
                    </Text>
                    <Text style={styles.mediSubText}>Dose</Text>
                </View>
                <View style={styles.singleMedicine}>
                    <Text
                        style={styles.mediMainText}>{selectedTag.tagMetaData.rxDrugInfo.doseFrequency}/day</Text>
                    <Text style={styles.mediSubText}>Frequency</Text>
                </View>
                <View style={styles.singleMedicine}>
                    <Text
                        style={styles.mediMainText}>{selectedTag.tagMetaData.rxDrugInfo.supply} days</Text>
                    <Text style={styles.mediSubText}>Days supply</Text>
                </View>
            </View>
        }
        return null;
    };

    const renderLookupValue = (array, valueToLookFor) => {
        if (!array) {
            return null;
        }
        const filteredArray = array.filter(data => data.name === valueToLookFor);

        return (
            <Text style={styles.itemStatus}>{filteredArray[0].value}</Text>
        )
    }

    const renderSubstanceUseInfo = () => {
        // console.log(selectedTag.tagMetaData.substanceUse);
        // console.log('display value');
        if (selectedTag.tagMetaData && selectedTag.tagMetaData.substanceUse) {
            return (
                <View style={styles.aptContent}>
                    <View style={styles.itemList}>
                        {selectedTag.tagMetaData.substanceUse.methodOfUse &&
                        <View style={styles.singleItem}>
                            <Text style={styles.itemTitle}>Method</Text>
                            {renderLookupValue(lookupData.methodsOfSubstanceUse, selectedTag.tagMetaData.substanceUse.methodOfUse)}
                        </View>
                        }
                        {selectedTag.tagMetaData.substanceUse.unitOfUse &&
                        <View style={styles.singleItem}>
                            <Text style={styles.itemTitle}>Unit</Text>
                            {renderLookupValue(lookupData.unitsOfSubstanceUse, selectedTag.tagMetaData.substanceUse.unitOfUse)}
                        </View>
                        }

                        {selectedTag.tagMetaData.substanceUse.lastUse &&
                        <View style={styles.singleItem}>
                            <Text style={styles.itemTitle}>Last use</Text>
                            {renderLookupValue(lookupData.lastSubstanceUse, selectedTag.tagMetaData.substanceUse.lastUse)}
                        </View>
                        }
                        {selectedTag.tagMetaData.substanceUse.currentFrequencyOfUse &&

                        <View style={styles.singleItem}>
                            <Text style={styles.itemTitle}>Frequency</Text>
                            {renderLookupValue(lookupData.currentFrequencyOfSubstanceUse, selectedTag.tagMetaData.substanceUse.currentFrequencyOfUse)}
                        </View>
                        }

                        {selectedTag.tagMetaData.substanceUse.howLongUsingThisLevel!==undefined &&

                        <View style={styles.singleItem}>
                            <Text style={styles.itemTitle}>For How Long</Text>
                            {renderLookupValue(lookupData.continuousLevelOfSubstanceUse, selectedTag.tagMetaData.substanceUse.howLongUsingThisLevel)}
                        </View>
                        }

                    </View>
                </View>
            )

        }
        return null;
    };

    const renderNotes = () => {
        if (selectedTag.notes && selectedTag.notes !== '') {
            return (
                <View style={styles.aptContent}>
                    <Text style={styles.contentHead}>Report notes</Text>
                    <Text style={styles.contentPara}>{selectedTag.notes}</Text>
                </View>
            )
        }
        return null;
    };

    const renderInterferenceWithLife = () => {
        if (selectedTag.tagMetaData && selectedTag.tagMetaData.interferenceInLife !== undefined) {
            return (
                <View style={{marginTop: 10}}>
                    {
                        selectedTag.tagMetaData.interferenceInLife ?
                            <View style={styles.interWrap}>
                                <Image
                                    style={styles.interIcon}
                                    source={require('../../assets/images/Interference.png')}/>
                                <Text style={styles.interText}>Interference with
                                    life</Text>
                            </View>
                            :
                            <View style={styles.interWrap}>
                                <Image
                                    style={styles.interIcon}
                                    source={require('../../assets/images/Interference-grey.png')}/>
                                <Text
                                    style={[styles.interText, {color: Colors.colors.lowContrast}]}>No
                                    interference with life</Text>
                            </View>
                    }
                </View>
            )
        }
        return null;
    };

    const getLookupValue = (lookup, key) => {
        if (!lookup) {
            return null;
        }
        const value = lookup.find(data => data.name === key);
        return (value && value.value) || null;
    };

    const renderSpecifications = () => {
        const {tagMetaData} = selectedTag;
        if(tagMetaData) {
        const {specification} = tagMetaData;
        if (specification && hasKeys(specification)) {
            const {
                relatedToMedicalCondition, relatedToMedication,
                relatedToSubstanceUse, relatedToWithdrawal
            } = specification;
            return (
                <View style={styles.aptContent}>
                    {relatedToMedicalCondition && relatedToMedicalCondition.length > 0 && (
                        <>
                            <Text style={styles.contentHead}>Related to Medical Condition</Text>
                            <Text style={styles.contentPara}>
                                {relatedToMedicalCondition
                                    .map(key => getLookupValue(lookupData.medicalCondition, key)).join(", ")}
                            </Text>
                        </>
                    )}
                    {relatedToMedication && relatedToMedication.length > 0 && (
                        <>
                            <Text style={styles.contentHead}>Related to Medications</Text>
                            <Text style={styles.contentPara}>{relatedToMedication.join(", ")}</Text>
                        </>
                    )}
                    {relatedToSubstanceUse && relatedToSubstanceUse.length > 0 && (
                        <>
                            <Text style={styles.contentHead}>Related to Substance Use</Text>
                            <Text style={styles.contentPara}>{relatedToSubstanceUse.join(", ")}</Text>
                        </>
                    )}
                    {relatedToWithdrawal && relatedToWithdrawal.length > 0 && (
                        <>
                            <Text style={styles.contentHead}>Related to Substance Withdrawal</Text>
                            <Text style={styles.contentPara}>{relatedToWithdrawal.join(", ")}</Text>
                        </>
                    )}
                </View>
            )
        }

        }
        return null;
    };

    let subText = null;
    if (selectedTag) {
        subText = getRelatedToText(selectedTag);
    }

    return (
        <Modal
            backdropPressToClose={true}
            backdropColor={Colors.colors.overlayBg}
            backdropOpacity={1}
            onClosed={onClose}
            isOpen={visible}
            style={{...CommonStyles.styles.commonModalWrapper,
                maxHeight: '80%'}}
            entry={"bottom"}
            position={"bottom"} swipeArea={100}>
            <View style={{...CommonStyles.styles.commonSwipeBar}}
                  {...addTestID('swipeBar')}
            />
            {selectedTag &&
            <Content
                showsVerticalScrollIndicator={false}>
                <View style={styles.topInfo}>
                    <Text
                        style={{
                            ...styles.typeText,
                            textTransform: 'capitalize',
                            color: DOMAIN_IMPORTANCE_COLORS[selectedTag.importanceLevel.name].textColor
                        }}>{selectedTag.importanceLevel.name ? selectedTag.importanceLevel.name : 'N/A'}</Text>
                    {
                        segments && (
                            <Text
                                style={styles.dateText}>+ {selectedTag.history.length} previous
                                reports</Text>
                        )
                    }

                </View>
                <Text
                    style={{...CommonStyles.styles.commonAptHeader}}>{selectedTag.elementName}</Text>
                {
                    subText !== null && <Text style={styles.subText}>{subText}</Text>
                }

                {
                    segments && (
                        <CommonSegmentHeader
                            segments={segments}
                            segmentChanged={setActiveTab}
                        />
                    )
                }


                <View>

                    {activeTab === 'information' && <>
                        <View style={styles.contentWrapper}>
                            <Image
                                style={styles.patientImg}
                                resizeMode={'cover'}
                                source={{uri: getAvatar({profilePicture: selectedTag.avatar})}}/>
                            <View style={styles.patientDetails}>
                                <Text
                                    style={styles.infoTitle}>{selectedTag.assignedBy==='SELF'? 'Patient, self-report':selectedTag.assignedBy}</Text>
                                <Text
                                    style={styles.infoContent}>{selectedTag.assignedAt ? 'Reported on ' + moment.utc(selectedTag.assignedAt).format('MMMM D, YYYY') : 'N/A'}</Text>
                            </View>
                        </View>
                        {renderDrugInfo()}
                        {renderSubstanceUseInfo()}
                        {renderNotes()}
                        {renderInterferenceWithLife()}
                        {renderSpecifications()}
                    </>
                    }

                    {/*History Section Starts*/}
                    {activeTab === 'history' &&
                    <View>
                        {selectedTag.history && selectedTag.history.length > 0 &&
                        selectedTag.history.map(historyDetail =>
                            <View style={{marginBottom: 16}}>

                                <View style={styles.contentWrapperMain}>
                                    <View style={styles.contentWrapper}>
                                        <Image
                                            style={styles.patientImg}
                                            resizeMode={'contain'}
                                            source={{uri: getAvatar({profilePicture: historyDetail.avatar})}}/>
                                        <View style={styles.patientDetails}>
                                            <Text
                                                style={styles.infoTitle}>{historyDetail.assignedBy}</Text>
                                            <Text
                                                style={styles.infoContent}>{historyDetail.assignedAt ? moment.utc(historyDetail.assignedAt).format('MMMM D, YYYY') : 'N/A'}</Text>

                                        </View>

                                    </View>
                                    {
                                        historyDetail.importanceLevel && historyDetail.importanceLevel.name !== undefined && (
                                            <View>
                                                <Text style={{
                                                    ...styles.infoContent,
                                                    color: DOMAIN_IMPORTANCE_COLORS[historyDetail.importanceLevel.name].textColor
                                                }}>
                                                    {historyDetail.importanceLevel.name}
                                                </Text>
                                            </View>
                                        )
                                    }

                                </View>

                                {
                                    historyDetail.notes !== undefined && (
                                        <View style={styles.aptContent}>
                                            <Text
                                                style={styles.contentPara}>{historyDetail.notes}</Text>
                                        </View>
                                    )
                                }
                            </View>
                        )
                        }


                    </View>


                    }

                </View>
                {actionable && (<View style={styles.modalBtns}>
                            {
                                selectedTag.importanceLevel.name.toLowerCase() !== 'resolved' && (
                                    <View style={{marginBottom: 16}}>
                                        <PrimaryButton
                                            testId="resolve"
                                            text="Resolve"
                                            onPress={() => {
                                                resolveAssociation(associationId)
                                            }}
                                            bgColor={Colors.colors.mainBlue10}
                                            textColor={Colors.colors.primaryText}
                                        />
                                    </View>
                                )
                            }

                            <View>
                                <PrimaryButton
                                    testId="update"
                                    onPress={() => {
                                        updateAssociation(selectedTag.domainElementId, selectedTag.domainTypeId)
                                    }}
                                    text="Update"
                                />
                            </View>
                        </View>)}

            </Content>
            }

        </Modal>
    )
}

const styles = StyleSheet.create({
    contentWrapperMain: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    medicineBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 24,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: Colors.colors.borderColor
    },
    singleMedicine: {},
    mediMainText: {
        color: Colors.colors.secondaryText,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextM,
        marginBottom: 4,
        textAlign: 'center'
    },
    mediSubText: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText,
        textAlign: 'center'
    },

    itemList: {},
    singleItem: {
        flexDirection: 'row',
        paddingBottom: 16,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.colors.highContrastBG
    },
    itemTitle: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.bodyTextS,
        flex: 1
    },
    subText: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.bodyTextS,
        marginBottom: 18
    },

    topInfo: {
        flexDirection: 'row',
        marginBottom: 8
    },
    typeText: {
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
        flexDirection: 'row',
        marginBottom: 16
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
        ...TextStyles.mediaTexts.captionText,
        textAlign: 'right'
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
    modalBtns: {
        paddingVertical: 24,
        paddingBottom: isIphoneX()? 34 : 24
    }
});
