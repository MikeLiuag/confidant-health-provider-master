// @flow
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity, Image
} from 'react-native'
import populateEvents from './Packer'
import React from 'react'
import moment from 'moment'
import _ from 'lodash'
import {APPOINTMENT_STATUS} from "../../constants/CommonConstants";
import {Colors} from "ch-mobile-shared";
import {Button} from "native-base";
import Icon from "react-native-vector-icons/Feather";

const LEFT_MARGIN = 50 - 1
// const RIGHT_MARGIN = 10
const CALENDER_HEIGHT = 2400
// const EVENT_TITLE_HEIGHT = 15
const TEXT_LINE_HEIGHT = 17
// const MIN_EVENT_TITLE_WIDTH = 20
// const EVENT_PADDING_LEFT = 4

function range(from, to) {
    return Array.from(Array(to), (_, i) => from + i)
}

export default class DayView extends React.Component {
    constructor(props) {
        super(props)
        const width = props.width - LEFT_MARGIN
        const packedEvents = populateEvents(props.events, width,this.props.durationType)
        let initPosition = _.min(_.map(packedEvents, 'top')) - CALENDER_HEIGHT / 24
        initPosition = initPosition < 0 ? 0 : initPosition
        this.state = {
            _scrollY: initPosition,
            packedEvents
        }
    }

    componentWillReceiveProps(nextProps) {
        const width = nextProps.width - LEFT_MARGIN
        this.setState({
            packedEvents: populateEvents(nextProps.events, width,this.props.durationType)
        })
    }

    componentDidMount() {
        this.props.scrollToFirst && this.scrollToFirst()
    }

    scrollToFirst() {
        setTimeout(() => {
            if (this.state && this.state._scrollY && this._scrollView) {
                this._scrollView.scrollTo({x: 0, y: this.state._scrollY, animated: true})
            }
        }, 1)
    }

    _renderLines() {
        const {format24h,durationType} = this.props;
        let numberByDurationType = 1;
        if(durationType){
            numberByDurationType = durationType < 60 ? (60/durationType):1;
        }
        const offset = CALENDER_HEIGHT / 24 * numberByDurationType;
        return range(0, 24).map((item, i) => {
            let timeText
            if (i === 0) {
                timeText = ``
            } else if (i < 12) {
                timeText = !format24h ? `${i} am` : i
            } else if (i === 12) {
                timeText = !format24h ? `${i} pm` : i
            } else if (i === 24) {
                timeText = !format24h ? `12 am` : 0
            } else {
                timeText = !format24h ? `${i - 12} pm` : i
            }
            const {width, styles} = this.props
            return [
                <Text
                    key={`timeLabel${i}`}
                    style={[styles.timeLabel, {top: offset * i - 10}]}
                >
                    {timeText}
                </Text>,
                i === 0 ? null : (
                    <View
                        key={`line${i}`}
                        style={[styles.line, {top: offset * i, width: width - 20}]}
                    >
                        <Image resizeMode="cover" style={{width: '100%'}} source={require('../../assets/images/slotBorder.png')}/>
                    </View>
                ),
            ]
        })
    };

    _renderTimeLabels() {
        const {styles} = this.props
        const offset = CALENDER_HEIGHT / 24
        return range(0, 24).map((item, i) => {
            return (
                <View key={`line${i}`} style={[styles.line, {top: offset * i}]}/>
            )
        })
    }

    _onEventTapped(event) {
        this.props.eventTapped(event)
    };

    getEventDetailsByType = (event) => {
        switch (event.type) {
            case APPOINTMENT_STATUS.PENDING :
                return {
                    color : Colors.colors.warningBG,
                    type : 'Pending'
                }
            case APPOINTMENT_STATUS.BOOKED :
                return {
                    color:Colors.colors.mediumPink,
                    type : 'Booked'
                }
            case APPOINTMENT_STATUS.PROPOSED:
                return {
                    color : Colors.colors.highContrastBG,
                    type : 'Proposed'

                }
            case APPOINTMENT_STATUS.REQUESTED:
                return {
                    color : Colors.colors.highContrastBG,
                    type : 'Request sent'
                }
            default :
                return {
                    color :Colors.colors.white,
                    type : 'Available'
                }
        }
    }

    _renderEvents() {
        const {styles, isWeekly} = this.props
        const {packedEvents} = this.state;
        let events = packedEvents.map((event, i) => {
            const style = {
                left: event.left,
                height: event.height,
                width: event.width,
                top: event.top,
                slot : event.slot
            }

            // Fixing the number of lines for the event title makes this calculation easier.
            // However it would make sense to overflow the title to a new line if needed
            const numberOfLines = Math.floor(event.height / TEXT_LINE_HEIGHT)
            const formatTime = this.props.format24h ? 'HH:mm' : 'hh:mm a'
            const isBookedAppointmentBooked = event?.type === 'BOOKED';
            const showStatus = (event?.type!=='' && !isBookedAppointmentBooked)
            return (
                <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => this._onEventTapped(this.props.events[event.index])}
                    key={i} style={[styles.event, style, {backgroundColor: 'transparent' }]}
                >
                    {this.props.renderEvent ? this.props.renderEvent(event) : (
                        <View style={styles.slotBoxWrapper}>
                            <View style={styles.slotBoxSingle}>
                                <View
                                    style={{...styles.slotBox, backgroundColor: this.getEventDetailsByType(event).color}}>
                                    <View style={styles.slotBoxInner}>
                                        <View style={styles.slotBoxInfoWrap}>
                                            <Text numberOfLines={2} style={{...styles.slotBoxInfoTitle,color:isBookedAppointmentBooked? Colors.colors.whiteColor : Colors.colors.highContrast}}>{event.title || 'Available'}</Text>
                                            <View style={styles.slotBoxInfoTimeWrapper}>
                                                <Text
                                                    style={{...styles.slotBoxInfoTime,color: isBookedAppointmentBooked? Colors.colors.whiteColor : Colors.colors.highContrast}}>{moment(event.start).format(formatTime)} - {moment(event.end).format(formatTime)}</Text>

                                                {isWeekly && showStatus && (
                                                    <View style={styles.statusWrapper}>
                                                        <View style={styles.statusBox}/>
                                                        <Text style={{...styles.slotBoxInfoTime,color: isBookedAppointmentBooked? Colors.colors.whiteColor : Colors.colors.highContrast}}>
                                                            {this.getEventDetailsByType(event).type}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                        <Button transparent style={styles.moreBtn}
                                                onPress={() => this._onEventTapped(this.props.events[event.index])}>
                                            <Icon style={styles.moreIcon} type={'Feather'} name="more-horizontal"
                                                  size={24} color={isBookedAppointmentBooked?Colors.colors.whiteColor:Colors.colors.primaryIcon}/>
                                        </Button>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}
                </TouchableOpacity>
            )
        })

        return (
            <View>
                <View style={{marginLeft: LEFT_MARGIN}}>
                    {events}
                </View>
            </View>
        )
    }

    render() {
        const {format24h,durationType,styles} = this.props;
        let numberByDurationType = 1;
        if(durationType){
            numberByDurationType = durationType < 60 ? (60/durationType):1;
        }
        return (
            <View style={[styles.contentStyle,{height: 2400 * numberByDurationType + 10}, {width: this.props.width}]}>
                {this._renderLines()}
                {this._renderEvents()}
            </View>
        )
    }
}
