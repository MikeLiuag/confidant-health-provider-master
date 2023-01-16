import React, {Component} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {addTestID, isIphoneX} from "ch-mobile-shared";
import moment from "moment";
import {Button} from "native-base";
import Icon from "react-native-vector-icons/FontAwesome";

export class FeedItem extends Component<Props> {

    constructor(props) {
        super(props);

    }

    renderCompletedConversation = () => {
        const {item, index} = this.props;
        return (
            <TouchableOpacity
                {...addTestID('completed-conversation - ' + (index + 1))}
                key={index}
                onPress={() => item.memberCount !== null && item.feedCount !== null && item.feedCount !== 0 ? (item.metaData ? this.navigateToNextScreen('CONVERSATION_DETAIL', item.metaData.contextId, null) : this.loadDetailPage('CONVERSATION_DETAIL', null, item.recapPeriod,item.timestamp, null)) : null}
                style={styles.singleFeed}>
                <View style={styles.innerWrap}>
                    <View style={styles.imgView}>
                        <Image
                            {...addTestID('conversational-report-png')}
                            source={require('../../assets/images/conversations-report.png')}
                            style={styles.feedImg}
                            resizeMode={'contain'}/>
                    </View>

                    < View style={styles.textWrapper}>
                        <View style={styles.titleRow}>
                            {item.metaData ?
                                <Text
                                    {...addTestID('member-name')}
                                    style={styles.feedTitle}>{item.metaData.memberName} completed {item.metaData.conversationName}</Text>
                                :
                                <Text
                                    style={styles.feedTitle}>{item.feedCount !== 0 ? 'Completed Conversations Report' : 'Completed Conversations Drop-off Report'}</Text>
                            }
                            <Text
                                style={styles.feedDate}>{item.timestamp !== null ? moment.utc(item.timestamp).format('MM/DD') : ''}</Text>
                        </View>

                        <View style={styles.titleRow}>
                            {!item.metaData ?
                                (item.memberCount !== null && item.feedCount !== null ?
                                        <Text style={styles.feedDes}><Text
                                            style={styles.countBold}>{item.memberCount}{' '}</Text>of
                                            your
                                            member{item.memberCount > 1 ? 's' : ''}{item.feedCount !== 0 ?
                                                <Text style={styles.feedDes}>{' '}completed
                                                    a total of{' '}<Text
                                                        style={styles.countBold}>{item.feedCount}{' '}</Text></Text> :
                                                <Text style={styles.feedDes}>{' '}have
                                                    not completed
                                                    any</Text>} conversation{item.feedCount > 1 ? 's' : ''}
                                        </Text>
                                        :
                                        <Text style={styles.feedDes}>None of your
                                            Members completed any
                                            conversation</Text>

                                ) : <Text>{''}</Text>}
                            {item.memberCount !== null && item.feedCount !== null && item.feedCount !== 0 && (

                                <Button
                                    {...addTestID('next-screen')}
                                    style={styles.nextButton}
                                    onPress={() => item.metaData ? this.navigateToNextScreen('CONVERSATION_DETAIL', item.metaData.contextId) : this.loadDetailPage('CONVERSATION_DETAIL', null, item.recapPeriod,item.timestamp, null, null)}
                                    transparent
                                >
                                    <Icon name="angle-right" size={32} color="#3fb2fe"/>
                                </Button>
                            )}
                        </View>
                    </View>

                </View>

            </TouchableOpacity>

        )
    };

    renderEducationFeed = () => {
        const {item, index} = this.props;
        return (
            <TouchableOpacity
                {...addTestID('educational-detail - ' + (index + 1))}
                key={index}
                onPress={() => item.memberCount !== null && item.feedCount !== null && item.feedCount !== 0 ? this.loadDetailPage('EDUCATION_DETAIL', null, item.recapPeriod,item.timestamp,null, null) : null}
                style={styles.singleFeed}>

                <View
                    style={styles.innerWrap}>
                    <View style={styles.imgView}>
                        <Image
                            {...addTestID('educational-report-png')}
                            source={require('../../assets/images/education-report.png')}
                            style={styles.feedImg}
                            resizeMode={'contain'}/>
                    </View>

                    < View style={styles.textWrapper}>
                        <View style={styles.titleRow}>
                            <Text
                                style={styles.feedTitle}>{item.feedCount !== 0 ?'Education Report' :+ 'Education Drop-off Report'}</Text>
                            <Text
                                style={styles.feedDate}>{item.timestamp !== null ? moment.utc(item.timestamp).format('MM/DD') : ''}</Text>
                        </View>

                        <View style={styles.titleRow}>
                            {item.memberCount !== null && item.feedCount !== null ?
                                <Text numberOfLines={2} style={styles.feedDes}><Text
                                    style={styles.countBold}>{item.memberCount}{' '}</Text>of
                                    your
                                    member{item.memberCount > 1 ? 's' : ''}{item.feedCount !== 0 ?
                                        <Text style={styles.feedDes}>{' '}read a total
                                            of{' '}<Text
                                                style={styles.countBold}>{item.feedCount}{' '}</Text></Text> :
                                        <Text style={styles.feedDes}>{' '}have not read
                                            any</Text>}{' '}Educational
                                    Article{item.feedCount > 1 ? 's' : ''}
                                </Text>
                                :
                                <Text style={styles.feedDes}>None of your Members have
                                    read any Educational
                                    Article</Text>
                            }

                            {item.memberCount !== null && item.feedCount !== null && item.feedCount !== 0 && (
                                <Button
                                    {...addTestID('load-detail-page')}
                                    style={styles.nextButton}
                                    onPress={() => this.loadDetailPage('EDUCATION_DETAIL', null, item.recapPeriod,item.timestamp,null, null, null)}
                                    transparent
                                >
                                    <Icon name="angle-right" size={32} color="#3fb2fe"/>
                                </Button>
                            )}

                        </View>


                    </View>

                </View>
            </TouchableOpacity>
        );
    };

    renderCompletedAppointment = () => {
        const {item, index} = this.props;
        return (
            <TouchableOpacity
                {...addTestID('completed-appointment- ' + (index + 1))}
                key={index}
                onPress={() => item.memberCount !== null && item.feedCount !== null && item.feedCount !== 0 ? (item.metaData ? this.navigateToNextScreen('COMPLETED_APPOINTMENT_DETAIL', null, item) : this.loadDetailPage('COMPLETED_APPOINTMENT_DETAIL', null, item.recapPeriod,item.timestamp, null)) : null}
                style={styles.singleFeed}>
                <View style={styles.innerWrap}>
                    <View style={styles.imgView}>
                        <Image
                            {...addTestID('appointment-report-png')}
                            source={require('../../assets/images/appointments-report.png')}
                            style={styles.feedImg}
                            resizeMode={'contain'}/>
                    </View>
                    <View style={styles.textWrapper}>
                        <View style={styles.titleRow}>
                            {item.metaData ?
                                <Text
                                    style={styles.feedTitle}>{item.metaData.memberName} completed
                                    an appointment
                                    with {item.metaData.providerName}</Text> :
                                <Text
                                    style={styles.feedTitle}>{item.feedCount !== 0 ?'Completed Appointments Report' :'Completed Appointments Drop-off Report'}</Text>
                            }
                            <Text
                                style={styles.feedDate}>{item.timestamp !== null ? moment.utc(item.timestamp).format('MM/DD') : ''}</Text>
                        </View>

                        <View style={styles.titleRow}>
                            {!item.metaData ?
                                (item.memberCount !== null && item.feedCount !== null ?
                                        <Text style={styles.feedDes}><Text
                                            style={styles.countBold}>{item.memberCount}{' '}</Text>of
                                            your
                                            member{item.memberCount > 1 ? 's' : ''}{item.feedCount !== 0 ?
                                                <Text style={styles.feedDes}>{' '}completed
                                                    a total of{' '}<Text
                                                        style={styles.countBold}>{item.feedCount}{' '}</Text></Text> :
                                                <Text style={styles.feedDes}>{' '}have
                                                    not completed
                                                    any</Text>} appointment{item.feedCount > 1 ? 's' : ''}
                                        </Text>
                                        :
                                        <Text style={styles.feedDes}>None of your
                                            Members completed any
                                            appointment</Text>

                                ) : <Text>{''}</Text>}
                            {item.memberCount !== null && item.feedCount !== null && item.feedCount !== 0 && (
                                <Button
                                    {...addTestID('completed-appointment-details-btn')}
                                    style={styles.nextButton}
                                    onPress={() => item.memberCount !== null && item.feedCount !== null && item.feedCount !== 0 ? (item.metaData ? this.navigateToNextScreen('COMPLETED_APPOINTMENT_DETAIL', null, item) : this.loadDetailPage('COMPLETED_APPOINTMENT_DETAIL', null, item.recapPeriod,item.timestamp, null)) : null}
                                    transparent
                                >
                                    <Icon name="angle-right" size={32} color="#3fb2fe"/>
                                </Button>

                            )}
                        </View>
                    </View>

                </View>

            </TouchableOpacity>

        );
    };

    renderScheduledAppointment = () => {
        const {item, index} = this.props;

        return (
            <TouchableOpacity
                {...addTestID('schedule-appointment- ' + (index + 1))}
                key={index}
                onPress={() => !item.metaData && item.memberCount !== null && item.feedCount !== null && item.feedCount !== 0 ? this.loadDetailPage('SCHEDULED_APPOINTMENT_DETAIL', null, item.recapPeriod,item.timestamp, null) : null}
                style={styles.singleFeed}>
                <View style={styles.innerWrap}>
                    <View style={styles.imgView}>
                        <Image
                            {...addTestID('appointments-report-png')}
                            source={require('../../assets/images/appointments-report.png')}
                            style={styles.feedImg}
                            resizeMode={'contain'}/>
                    </View>

                    < View style={styles.textWrapper}>
                        <View style={styles.titleRow}>
                            {item.metaData ?
                                <Text
                                    {...addTestID('schedule-provider-and-member-name')}
                                    style={styles.feedTitle}>{item.metaData.memberName} scheduled
                                    an appointment
                                    with {item.metaData.providerName}</Text>
                                :
                                <Text
                                    style={styles.feedTitle}>{item.feedCount !== 0 ?'Scheduled Appointments Report' :'Scheduled Appointments Drop-off Report'}</Text>
                            }
                            <Text
                                style={styles.feedDate}>{item.timestamp !== null ? moment.utc(item.timestamp).format('MM/DD') : ''}</Text>
                        </View>
                        <View style={styles.titleRow}>
                            {!item.metaData ?
                                (item.memberCount !== null && item.feedCount !== null ?
                                        <Text style={styles.feedDes}><Text
                                            style={styles.countBold}>{item.memberCount}{' '}</Text>of
                                            your
                                            member{item.memberCount > 1 ? 's' : ''}{item.feedCount !== 0 ?
                                                <Text style={styles.feedDes}>{' '}scheduled
                                                    a total of{' '}<Text
                                                        style={styles.countBold}>{item.feedCount}{' '}</Text></Text> :
                                                <Text style={styles.feedDes}>{' '}have
                                                    not completed
                                                    any</Text>} appointment{item.feedCount > 1 ? 's' : ''}
                                        </Text>
                                        :
                                        <Text style={styles.feedDes}>None of your
                                            Members scheduled any
                                            appointment</Text>

                                ) : <Text>{''}</Text>}

                            {!item.metaData && item.memberCount !== null && item.feedCount !== null && item.feedCount !== 0 && (
                                <Button
                                    {...addTestID('schedule-appointment-detail-btn')}
                                    style={styles.nextButton}
                                    onPress={() => this.loadDetailPage('SCHEDULED_APPOINTMENT_DETAIL', null, item.recapPeriod,item.timestamp, null, null)}
                                    transparent
                                >
                                    <Icon name="angle-right" size={32} color="#3fb2fe"/>
                                </Button>
                            )}
                        </View>

                    </View>

                </View>

            </TouchableOpacity>

        );
    };

    renderWroteNotes = () => {
        const {item, index} = this.props;

        return (
            <TouchableOpacity
                {...addTestID('wrote-session-notes')}
                key={index}
                onPress={() => this.loadDetailPage('SESSION_NOTES_DETAIL', item.metaData.appointmentId, null,null, item.metaData.cost)}
                style={styles.singleFeed}>
                <View style={styles.innerWrap}>
                    <View style={styles.imgView}>
                        <Image
                            {...addTestID('notes-png')}
                            source={require('../../assets/images/notes.png')}
                            style={styles.feedImg}
                            resizeMode={'contain'}/>
                    </View>

                    < View style={styles.textWrapper}>
                        <View style={styles.titleRow}>
                            <Text
                                style={styles.feedTitle}>{item.metaData.providerName} wrote
                                notes - Re: {item.metaData.memberName}</Text>
                            <Text
                                style={styles.feedDate}>{item.timestamp !== null ? moment.utc(item.timestamp).format('MM/DD') : ''}</Text>
                        </View>
                        <View style={styles.titleRow}>
                            <Text
                                style={styles.feedDes}>{item.metaData.sessionNotes ? item.metaData.sessionNotes : 'N/A'} </Text>
                            <Button
                                {...addTestID('session-notes-btn')}
                                style={styles.nextButton}
                                onPress={() => this.loadDetailPage('SESSION_NOTES_DETAIL', item.metaData.appointmentId, null,null, item.metaData.cost, item.metaData.status)}
                                transparent
                            >
                                <Icon name="angle-right" size={32} color="#3fb2fe"/>
                            </Button>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>

        );
    };

    renderAskedQuestion = () => {
        const {item, index} = this.props;
        return (
            <TouchableOpacity
                {...addTestID('asked-question')}
                key={index}
                onPress={() => this.loadDetailPage('ASKED_QUESTION_DETAIL', item.metaData.appointmentId, null,null, item.metaData.cost)}
                style={styles.singleFeed}>
                <View style={styles.innerWrap}>
                    <View style={styles.imgView}>
                        <Image
                            {...addTestID('some-one-asked-png')}
                            source={require('../../assets/images/someone-asked.png')}
                            style={styles.feedImg}
                            resizeMode={'contain'}/>
                    </View>

                    < View style={styles.textWrapper}>
                        <View style={styles.titleRow}>
                            <Text
                                style={styles.feedTitle}>{item.metaData.providerName} asked
                                - Re: {item.metaData.memberName}</Text>
                            <Text
                                style={styles.feedDate}>{item.timestamp !== null ? moment.utc(item.timestamp).format('MM/DD') : ''}</Text>
                        </View>
                        <View style={styles.titleRow}>
                            <Text
                                style={styles.feedDes}>{item.metaData.question ? item.metaData.question : 'N/A'} </Text>
                            <Button
                                {...addTestID('asked-question-btn')}
                                style={styles.nextButton}
                                onPress={() => this.loadDetailPage('ASKED_QUESTION_DETAIL', item.metaData.appointmentId, null,null, item.metaData.cost, item.metaData.status)}
                                transparent
                            >
                                <Icon name="angle-right" size={32} color="#3fb2fe"/>
                            </Button>
                        </View>
                    </View>

                </View>
            </TouchableOpacity>

        );
    };

    findConnectionAvatar = (connectionId) => {
        return this.props.findConnectionAvatar(connectionId);
    };
    findAvatarColorCode = (connectionId) => {
        return this.props.findAvatarColorCode(connectionId);
    };

    loadDetailPage = (detailPageToLoad, appointmentId, period,timestamp, sessionCost) => {
        this.props.loadDetailPage(detailPageToLoad, appointmentId, period,timestamp, sessionCost);
    };

    navigateToNextScreen = (detailPageToLoad, contextId, appointmentData) => {
        this.props.navigateToNextScreen(detailPageToLoad, contextId, appointmentData);
    };


    renderPostedProviderReview = () => {
        const {item, index} = this.props;
        const avatar = this.findConnectionAvatar(item.memberId);
        return (
            <TouchableOpacity
                {...addTestID('posted-provider-review')}
                key={index}
                onPress={() => this.loadDetailPage('REVIEW_DETAIL', item.metaData.appointmentId, null,null,item.metaData.sessionCost)}
                style={styles.singleFeed}>
                <View style={styles.innerWrap}>
                    <View style={styles.imgView}>
                        {avatar ?
                            <Image
                                source={{uri: avatar}}
                                style={styles.proImage}
                                resizeMode={'cover'}/>
                            :
                            <View style={{
                                ...styles.proBg,
                                backgroundColor: this.findAvatarColorCode(item.memberId)
                            }}><Text
                                style={styles.proLetter}>{item.metaData.memberName.charAt(0).toUpperCase()}</Text></View>
                        }
                    </View>

                    <View style={styles.textWrapper}>
                        <View style={styles.titleRow}>
                            <Text
                                style={styles.feedTitle}>{item.metaData.memberName} rated {item.metaData.providerName} - {item.metaData.rating | 0} star{item.metaData.rating > 1 ? 's' : ''}</Text>
                            <Text
                                style={styles.feedDate}>{item.timestamp !== null ? moment.utc(item.timestamp).format('MM/DD') : ''}</Text>
                        </View>
                        <View style={styles.titleRow}>
                            <Text
                                style={styles.feedDes}>{item.metaData.publicComment ? item.metaData.publicComment : 'No public feedback'} </Text>
                            <Button
                                {...addTestID('review-btn')}
                                style={styles.nextButton}
                                onPress={() => this.loadDetailPage('REVIEW_DETAIL', item.metaData.appointmentId, null, null,item.metaData.cost)}
                                transparent
                            >
                                <Icon name="angle-right" size={32} color="#3fb2fe"/>
                            </Button>
                        </View>
                    </View>


                </View>

            </TouchableOpacity>

        );
    };



    render() {
        return (<TouchableOpacity>
            {this.props.item.activityType === 'READ_EDUCATION' && this.renderEducationFeed()}
            {this.props.item.activityType === 'COMPLETED_CONVERSATION' && this.renderCompletedConversation()}
            {this.props.item.activityType === 'COMPLETED_APPOINTMENT' && this.renderCompletedAppointment()}
            {this.props.item.activityType === 'SCHEDULED_APPOINTMENT' && this.renderScheduledAppointment()}
            {this.props.item.activityType === 'WROTE_SESSION_NOTES' && this.renderWroteNotes()}
            {this.props.item.activityType === 'ASKED_QUESTION' && this.renderAskedQuestion()}
            {this.props.item.activityType === 'POSTED_PROVIDER_REVIEW' && this.renderPostedProviderReview()}
        </TouchableOpacity>)
    }

}

const styles = StyleSheet.create({
    singleFeed: {
        padding: 16,
        borderWidth: 0.5,
        borderColor: 'rgba(0,0,0,0.07)',
        shadowColor: 'rgba(0,0,0,0.07)',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowRadius: 8,
        shadowOpacity: 1.0,
        elevation: 0,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        borderRadius: 8,
        overflow: 'hidden'
    },
    innerWrap: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    imgView: {},
    feedImg: {
        width: 48
    },
    proImage: {
        width: 48,
        height: 48,
        borderRadius: 30,
        overflow: 'hidden'
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 206, 198, 0.1)'
    },
    textWrapper: {
        paddingLeft: 24,
        justifyContent: 'center',
        flex: 2
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    feedTitle: {
        fontFamily: 'Roboto-Bold',
        fontWeight: '500',
        color: '#25345C',
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 4,
        flex: 1,
        paddingRight: 10
    },
    feedDate: {
        fontFamily: 'Roboto-Regular',
        color: '#969FA8',
        fontSize: 12,
        lineHeight: 20,
        letterSpacing: 0.2,
        textAlign: 'right'
    },
    feedDes: {
        fontFamily: 'Roboto-Regular',
        color: '#646C73',
        fontSize: 13,
        lineHeight: 20,
        flex: 1,
        paddingRight: 10,
        //textTransform:'lowercase'
    },
    nextButton: {
        height: 30,
        paddingTop: 0,
        paddingBottom: 0,
        alignItems: 'flex-start',
        marginTop: -5
    },
    countBold: {
        fontWeight: 'bold',
        fontSize: 11
    },
    modal: {
        alignItems: 'center',
        borderColor: '#f5f5f5',
        borderTopWidth: 0.5,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: 450
    },
    filterHead: {
        width: '100%',
        alignItems: 'center',
        borderBottomColor: '#F5F5F5',
        borderBottomWidth: 1,
        paddingTop: 24,
        paddingBottom: 24
    },
    filterText: {
        fontFamily: 'Roboto-Regular',
        color: '#25345C',
        fontSize: 17,
        lineHeight: 18,
        letterSpacing: 0.8,
        textAlign: 'center'
    },
    filterBody: {
        height: 330
    },
    filterScroll: {
        maxHeight: 300
    },
    filterBtn: {
        padding: 24,
        paddingTop: 0,
        paddingBottom: isIphoneX() ? 34 : 24
    },
    swipeBar: {
        backgroundColor: '#f5f5f5',
        width: 80,
        height: 4,
        borderRadius: 2,
        top: -35
    },
    arrowBtn: {
        paddingTop: 0,
        paddingBottom: 0,
        height: 20,
        marginBottom: 24,
        justifyContent: 'center',
        width: 80
    },
    multiList: {
        justifyContent: 'space-between',
        borderBottomWidth: 0,
        marginLeft: 0,
        paddingLeft: 24
    },
    multiListText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        letterSpacing: 0.3,
        color: '#515d7d',
        paddingRight: 10,
        flex: 1
    },
    multiTextSelected: {
        fontFamily: 'Roboto-Regular',
        fontWeight: '600',
        fontSize: 15,
        letterSpacing: 0.3,
        color: '#3fb2fe'
    },
    multiRadio: {
        width: 22,
        height: 21,
        borderWidth: 1,
        borderColor: '#ebebeb',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 4
    },
    multiRadioSelected: {
        width: 22,
        height: 21,
        borderWidth: 1,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 4,
        backgroundColor: '#3fb2fe',
        borderColor: '#3fb2fe'
    },
    noResult: {
        flex: 1,
        justifyContent: 'center'
    },

    proBg: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 48,
        height: 48,
        borderRadius: 30,
        overflow: 'hidden',

    },
    proLetter: {
        fontFamily: 'Roboto-Bold',
        color: '#fff',
        fontSize: 24,
        fontWeight: '600',
        textTransform: 'uppercase'
    },
});
