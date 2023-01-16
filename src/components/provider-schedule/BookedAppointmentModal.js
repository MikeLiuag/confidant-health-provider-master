import React, {Component} from 'react';
import { View, Image, StyleSheet } from 'react-native';
import {Content, Text} from 'native-base';
import {Colors, CommonStyles, getAvatar, TextStyles} from "ch-mobile-shared";
import {TransactionSingleActionItem} from "ch-mobile-shared/src/components/TransactionSingleActionItem";
import AntIcon from "react-native-vector-icons/AntDesign";
import FeatherIcon from "react-native-vector-icons/Feather";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MUIcon from "react-native-vector-icons/MaterialIcons";
import moment from "moment";

export class BookedAppointmentModal extends Component<Props> {
    constructor(props) {
        super(props);
        this.state = {};
    }

    performActionAction = (btn)=>{
        let {appointment} = this.props;
        if(btn.actionType === 'CANCEL_APPOINTMENT'){
            this.props.cancelAppointment(appointment.appointmentId);
        }else if(btn.actionType === 'GO_TO_CHAT'){
            this.props.navigateToLiveChat();
        }else if(btn.actionType === 'CHANGE_TIME'){
            this.props.changeTime();
        }else if(btn.actionType === 'CHANGE_DATE'){
            this.props.changeDate();
        }else if(btn.actionType === 'ACCEPT_APPOINTMENT'){
            this.props.confirmAppointment(appointment.appointmentId);
        }
    }


    renderIcon =(btn) =>{

        switch (btn.iconType) {
            case 'Feather' : return <FeatherIcon size={22} color={btn.iconColor} name={btn.iconName}/>
            case 'AntDesign' : return <AntIcon size={22} color={btn.iconColor} name={btn.iconName}/>
            case 'MaterialIcons' : return <MUIcon size={22} color={btn.iconColor} name={btn.iconName}/>
            case 'FontAwesome' : return <FontAwesome size={22} color={btn.iconColor} name={btn.iconName}/>
            default : return null
        }
    }

    render() {
        let {appointment,actionButtonList,applyFilter} = this.props;
        if(applyFilter){
            actionButtonList = actionButtonList.filter(actionBtn => actionBtn.includesIn.includes(appointment?.status));
        }
        let day;
        if(appointment?.selectedDate){
            day = moment(appointment?.selectedDate ,'MM-DD-YYYY').format("dddd");
        }else{
            day = moment(appointment?.startTime ,'YYYY-MM-DD HH:mm:ss').format("dddd");
        }

        return (
            <Content showsVerticalScrollIndicator={false}>
                <View style={styles.actionsTopWrapper}>
                    <View style={styles.modalTitleWrapper}>
                        <Text
                            style={styles.modalTitleText}>{`${day}, ${appointment.startText} - ${appointment.endText}`}</Text>
                    </View>
                    <View style={{...styles.appointmentPersonalInfoWrapper, marginBottom: 20, marginTop: 4}}>
                        <View>
                            <View>
                                {appointment?.participantImage ?
                                    <Image style={styles.appointmentProImage}
                                           resizeMode={"cover"}
                                           source={{uri: getAvatar({profilePicture: appointment.participantImage})}}
                                           alt="Icon"
                                    />
                                    :
                                    <View style={{
                                        ...styles.appointmentProBgMain,
                                        backgroundColor: Colors.colors.mainBlue
                                    }}
                                    ><Text
                                        style={styles.appointmentProLetterMain}>{appointment.participantName?.charAt(0).toUpperCase() || appointment.memberName?.charAt(0).toUpperCase()}</Text></View>
                                }
                            </View>
                        </View>
                        <View style={styles.appointmentItemDetail}>
                            <Text style={styles.appointmentItemName}>{appointment.participantName}</Text>
                            <Text style={styles.appointmentItemDes}
                                  numberOfLines={1}>{appointment.serviceName}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.actionList}>
                    {actionButtonList && actionButtonList.map(btn=>{
                        return(
                            <View style={styles.btnOptions}>
                                <TransactionSingleActionItem
                                    title={btn.title}
                                    iconBackground={btn.iconBackground}
                                    styles={styles.gButton}
                                    renderIcon={(size,color)=>{
                                        return this.renderIcon(btn)
                                    }}
                                    onPress={()=>{
                                        this.performActionAction(btn);
                                    }}
                                />
                            </View>
                        )
                    })}
                </View>
            </Content>
        )
    }
}

const styles = StyleSheet.create({
    modalTitleWrapper:{
        marginBottom:10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    actionsTopWrapper:{
        marginBottom: 16,
    },
    modalTitleText:{
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
    },
    modalTitleSubText:{
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.inputLabel,
        color: Colors.colors.mediumContrast,
    },
    modalTitleSubTextBottom:{
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.TextH7,
        color: Colors.colors.mediumContrast,
    },
    btnOptions: {
        marginBottom: 8,
    },
    appointmentProImage: {
        width: 48,
        height: 48,
        borderRadius: 80,
        overflow: 'hidden',
    },
    appointmentProBgMain: {
        width: 48,
        height: 48,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    appointmentProLetterMain: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH6,
        color: Colors.colors.whiteColor,
    },
    appointmentItemDetail: {
        paddingLeft: 12,
    },
    appointmentItemName: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH7,
        color: Colors.colors.highContrast,
    },
    appointmentItemDes: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.subTextS,
        color: Colors.colors.mediumContrast,
    },
    appointmentCard:{
        borderRadius: 12,
        backgroundColor: Colors.colors.whiteColor,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        ...CommonStyles.styles.shadowBox,
        marginBottom: 8,
    },
    appointmentCardTop:{
        paddingHorizontal: 16,
        paddingVertical: 16,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomColor: 'rgba(0,0,0,0.05)',
        borderStyle: 'solid',
        borderBottomWidth: 1,
    },
    appointmentTimingWrapper:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '75%'
    },
    appointmentTimingText:{
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextM,
        color: Colors.colors.highContrast,
    },
    appointmentCardBottom: {
        flexDirection :'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 28,
    },
    appointmentPersonalInfoWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
