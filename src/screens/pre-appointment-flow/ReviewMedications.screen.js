import React, {Component} from 'react';
import {StatusBar, StyleSheet, Image, FlatList, TouchableOpacity, ScrollView} from 'react-native';
import {Container, Content, Text, View } from 'native-base';
import {addTestID, isIphoneX, Colors, PrimaryButton, TextStyles, CommonStyles, CustomModal } from 'ch-mobile-shared';
import { PreApptHeader } from "../../components/pre-appointment/PreApptHeader.component";
import { CommonReviewItem } from "../../components/pre-appointment/CommonReviewItem.component";
import Modal from 'react-native-modalbox';
import {Screens} from '../../constants/Screens';
import {CommonSegmentHeader} from "../../components/pre-appointment/CommonSegmentHeader.component";

const DATA = [
    {
        title: 'Wellbutrin',
        type: 'Antidepressants',
        typeColor: Colors.colors.lowContrast,
        subTitle: '100 mg twice daily'
    },
    {
        title: 'Quetiapine',
        type: 'Seroquel',
        typeColor: Colors.colors.lowContrast,
        subTitle: '50 mg once a day, 10 days total'
    }
];


export default class ReviewMedicationsScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            modalHeightProps: {
                height: 0
            }
        };
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };


    detailDrawerClose = () => {
        this.refs.modalDetailView.close();
        this.setState({
            modalHeightProps: {
                height: 0,

            }
        });
    };

    onLayout(event) {
        const {height} = event.nativeEvent.layout;
        const newLayout = {
            height: height
        };
        setTimeout(()=>{
            this.setState({ modalHeightProps: newLayout });
        }, 10)

    }

    navigateToNextScreen = () => {
        // this.props.navigation.navigate(Screens.REVIEW_SYMPTOMS_SCREEN);
    };

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);

        return (
            <Container style={{ backgroundColor: Colors.colors.screenBG }}>
                <StatusBar
                    backgroundColor="transparent"
                    barStyle="dark-content"
                    translucent
                />
                <PreApptHeader
                    onPress={this.backClicked}
                    headerText={'Review Medications'}
                />
                <Content>
                    <View style={styles.eventList}>
                        <FlatList
                            data={DATA}
                            renderItem={({item, index}) =>
                                <CommonReviewItem
                                    key={index}
                                    onPress={() => {
                                        this.refs.modalDetailView.open()
                                    }}
                                    dateText={item.date}
                                    title={item.title}
                                    subText={item.subTitle}
                                    typeColor={item.typeColor}
                                    typeText={item.type}
                                    previousReports={item.preReports}
                                />
                            }
                            keyExtractor={item => item.id}
                        />


                    </View>
                </Content>
                <View
                    {...addTestID('view')}
                    style={styles.greBtn}>
                    <PrimaryButton
                        testId = "continue"
                        onPress={() => {this.navigateToNextScreen();}}
                        text="Continue"
                    />
                </View>


                <Modal
                    backdropPressToClose={true}
                    backdropColor={ Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={this.detailDrawerClose}
                    style={{...CommonStyles.styles.commonModalWrapper,
                        maxHeight: '60%',
                        // bottom: this.state.modalHeightProps.height,
                        // maxHeight: 720
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"modalDetailView"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />
                    <Content
                        showsVerticalScrollIndicator={false}>
                        <View style={styles.topInfo}>
                            <Text style={styles.typeText}>Antidepressants</Text>
                        </View>
                        <Text style={{...CommonStyles.styles.commonAptHeader}}>Wellbutrin</Text>
                        <CommonSegmentHeader
                            firstTabText={'Information'}
                            secondTabText={'History'}
                        />
                        <View>
                            <View style={styles.contentWrapper}>
                                <Image
                                    style={styles.patientImg}
                                    resizeMode={'contain'}
                                    source={require('../../assets/images/p3.png')}  />
                                <View style={styles.patientDetails}>
                                    <Text style={styles.infoTitle}>Patient, self-report</Text>
                                    <Text style={styles.infoContent}>Reported on March 12, 2021</Text>
                                </View>
                            </View>

                            <View style={styles.medicineBox}>
                                <View style={styles.singleMedicine}>
                                    <Text style={styles.mediMainText}>100 mg</Text>
                                    <Text style={styles.mediSubText}>Dose</Text>
                                </View>
                                <View style={styles.singleMedicine}>
                                    <Text style={styles.mediMainText}>2/day</Text>
                                    <Text style={styles.mediSubText}>Frequency</Text>
                                </View>
                                <View style={styles.singleMedicine}>
                                    <Text style={styles.mediMainText}>10 days</Text>
                                    <Text style={styles.mediSubText}>Days supply</Text>
                                </View>
                            </View>
                            <View style={styles.aptContent}>
                                <Text style={styles.contentHead}>Report notes</Text>
                                <Text style={styles.contentPara}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris aliquam sem eget libero egestas, ut dignissim nunc vehicula.</Text>
                                <Text style={styles.contentPara}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris aliquam sem eget libero egestas, ut dignissim nunc vehicula.</Text>
                                <Text style={styles.contentPara}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris aliquam sem eget libero egestas, ut dignissim nunc vehicula.</Text>
                            </View>
                        </View>
                    </Content>
                </Modal>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    eventList: {
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: 30,
        paddingBottom: 30
    },
    medicineBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 24,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: Colors.colors.borderColor
    },
    singleMedicine: {

    },
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
    aptContent: {
        paddingTop: 30
    },
    topInfo: {
        flexDirection: 'row',
        marginBottom: 8
    },
    typeText: {
        color: Colors.colors.lowContrast,
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
        marginBottom: 32
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
    contentHead: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH4,
        marginBottom: 8
    },
    contentPara: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextS,
        marginBottom: 16
    },
    greBtn: {
        padding: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
        borderTopRightRadius: 12,
        borderTopLeftRadius: 12,
        ...CommonStyles.styles.stickyShadow
    }
});
