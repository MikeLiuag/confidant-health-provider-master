import React, {Component} from 'react';
import {StatusBar, StyleSheet, Image, FlatList, TouchableOpacity, ScrollView} from 'react-native';
import {Container, Content, Text, View } from 'native-base';
import {addTestID, isIphoneX, Colors, PrimaryButton, TextStyles, CommonStyles, CustomModal } from 'ch-mobile-shared';
import { PreApptHeader } from "../../components/pre-appointment/PreApptHeader.component";
import { CommonReviewItem } from "../../components/pre-appointment/CommonReviewItem.component";
import Modal from 'react-native-modalbox';
import {Screens} from '../../constants/Screens';
import {CommonSegmentHeader} from "../../components/pre-appointment/CommonSegmentHeader.component";
import {ReadMoreBtn} from "../../components/post-appointment/ReadMoreBtn.component";

const DATA = [
    {
        title: 'Major depressive disorder',
        type: 'Negative',
        typeColor: Colors.colors.errorText,
        preReports: '+ 8 previous reports'
    },
    {
        title: 'Nicotine Use Disorder',
        type: 'Positive',
        typeColor: Colors.colors.successText,
        subTitle: 'Related to Substance Use'
    },
    {
        title: 'Alcohol Use Disorder',
        type: 'Neutral',
        typeColor: Colors.colors.primaryText,
        preReports: '+ 8 previous reports',
        subTitle: 'Related to Substance Use'
    }
];

export default class ReviewDiagnosesScreen extends Component<Props> {
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
        this.props.navigation.navigate(Screens.REVIEW_MEDICATIONS_SCREEN);
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
                    headerText={'Review Diagnoses'}
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
                        maxHeight: '80%',
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
                            <Text style={styles.typeText}>Misreported</Text>
                            <Text style={styles.dateText}>+ 8 previous reports</Text>
                        </View>
                        <Text style={{...CommonStyles.styles.commonAptHeader}}>Conflict with school officials</Text>
                        <Text style={styles.modalSubTitle}>Related to Substance Use</Text>
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
                                <Text style={styles.typeText}>High</Text>
                            </View>
                            <View style={styles.aptContent}>
                                <Text style={styles.contentHead}>Report notes</Text>
                                <Text style={styles.contentPara}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris aliquam sem eget libero egestas, ut dignissim nunc vehicula.</Text>
                                <ReadMoreBtn
                                />
                                <Text style={styles.contentHead}>Summary</Text>
                                <Text style={styles.contentPara}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris aliquam sem eget libero egestas, ut dignissim nunc vehicula.</Text>


                                <View style={styles.contentWrapper}>
                                    <Image
                                        style={styles.patientImg}
                                        resizeMode={'contain'}
                                        source={require('../../assets/images/p3.png')}  />
                                    <View style={styles.patientDetails}>
                                        <Text style={styles.infoTitle}>Patient, self-report</Text>
                                        <Text style={styles.infoContent}>Reported on March 12, 2021</Text>
                                    </View>
                                    <Text style={styles.typeText}>High</Text>
                                </View>

                                <Text style={styles.contentHead}>Therapeutic Philosophy </Text>
                                <Text style={styles.contentPara}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris aliquam sem eget libero egestas, ut dignissim nunc vehicula.</Text>
                                <ReadMoreBtn
                                />
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
    aptContent: {
        // paddingTop: 30
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
    modalSubTitle: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.bodyTextS,
        marginBottom: 24
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
        paddingLeft: 12,
        flex: 1
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
