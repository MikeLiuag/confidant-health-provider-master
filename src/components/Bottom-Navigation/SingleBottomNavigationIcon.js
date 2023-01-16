import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Icon} from 'native-base';
import {addTestID, isIphoneX, getTabMargin } from "ch-mobile-shared";
import {connectAuth} from "../../redux/modules/auth";
import {connectReduxState} from "../../redux/modules";
import {Screens} from "../../constants/Screens";
import moment from "moment";

const TAB_MARGIN = getTabMargin();

class SingleBottomNavigationIcon extends React.PureComponent {

    constructor(props) {
        super(props);
    }

    hasBadge = () => {
        switch (this.props.routeName) {
            case Screens.CHAT_LIST: {
                if (this.props.connections.activeConnections.length > 0) {
                    let hasBadge = false;
                    this.props.connections.activeConnections.forEach(connection => {
                        if (connection.lastMessageUnread) {
                            hasBadge = true;
                        }
                    });
                    return hasBadge;
                }
                return false;
            }
            case Screens.APPOINTMENTS_SCREEN: {
                if (this.props.appointments.currentAppointments.length > 0) {
                    let hasBadge = false;
                    this.props.appointments.currentAppointments.forEach(appointment => {
                        if (appointment.status === 'NEEDS_ACTION') {
                            hasBadge = true;
                        }
                        if (appointment.status === 'BOOKED') {
                            if (moment().isSame(moment(appointment.startTime), 'days')
                                && !this.isMissed(appointment)) {
                                hasBadge = true;
                            }
                        }
                    });
                    return hasBadge;
                }
                return false;
            }
            default: {
                return false
            }
        }
    };

    isMissed = (appt)=>{
        return moment(appt.endTime).diff(moment(), 'minutes')<0
    };

    render() {
        const hasBadge = this.hasBadge();
        return (
            <View
                {...addTestID('bottom-icon-'+(this.props.iconName))}
                style={{...styles.redRing, backgroundColor: 'transparent', borderColor: 'transparent'}}>
                <Icon
                    {...addTestID(this.props.iconName + ' - Icon')}
                    type={this.props.iconName === 'feed'? "FontAwesome" : "Feather"} name={this.props.iconName}
                      style={this.props.focused ? [styles.iconStyle, {color: '#3fb2fe'}] : styles.iconStyle}/>
                {hasBadge && (<View style={{...styles.redDot, display: hasBadge ? 'flex' : 'none'}}/>)}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    foot: {
        backgroundColor: '#fff',
        justifyContent: 'flex-start',
    },
    // Footer Tab Style
    tabStyle: {
        backgroundColor: 'white',
        borderTopWidth: 0.5,
        borderTopColor: '#d1d1d1',
        justifyContent: 'flex-start',
        height: isIphoneX() ? 50 : 70,
        paddingTop: isIphoneX() ? 15 : 0,
        paddingBottom: 0
    },
    iconStyle: {
        color: '#d1d1d1',
        fontSize: 25,
        backgroundColor: 'rgba(255,255,255, 0.45)'
    },
    tabIcon: {
        resizeMode: 'contain',
        height: 25,
    },
    redRing: {
        backgroundColor: 'transparent',
        width: 40,
        height: 40,
        borderRadius: 17,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        paddingTop: 4,
        marginTop: TAB_MARGIN
    },
    redDot: {
        position: 'absolute',
        top: 2,
        right: 1,
        width: 13,
        height: 13,
        borderRadius: 8,
        backgroundColor: '#EC0D4E',
        borderWidth: 3,
        borderColor: '#fff'
    }
});

export default connectReduxState()(SingleBottomNavigationIcon);
