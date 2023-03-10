import {
    VirtualizedList, View, TouchableOpacity, Image, Text
} from 'react-native'
import _ from 'lodash'
import moment from 'moment'
import React from 'react'
import {styleConstructor} from './style'
import DayView from './DayView'

export default class EventCalendar extends React.Component {
    constructor(props) {
        super(props)
        this.styles = styleConstructor;
        this.state = {
            date: moment(this.props.initDate),
            index: this.props.size
        }
    }

    static defaultProps = {
        size: 30,
        initDate: new Date(),
        formatHeader: 'DD MMMM YYYY'
    }

    _getItemLayout =(data, index)=> {
        const {width} = this.props
        return {length: width, offset: width * index, index}
    };

    _getItem =(events, index)=> {
        const date = moment(this.props.initDate).add(index - this.props.size, 'days')
        return _.filter(events, event => {
            const eventStartTime = moment(event.start)
            return eventStartTime >= date.clone().startOf('day') &&
                eventStartTime <= date.clone().endOf('day')
        })
    }

    _renderItem =({index, item})=> {
        const {width, format24h, initDate, scrollToFirst,isWeekly,durationType} = this.props
        const date = moment(initDate).add(index - this.props.size, 'days')
        return (
            <DayView
                date={date}
                index={index}
                format24h={format24h}
                eventTapped={this.props.eventTapped}
                events={item}
                width={width}
                styles={this.styles}
                scrollToFirst={scrollToFirst}
                isWeekly = {isWeekly}
                durationType = {durationType}
            />
        )
    }

    _goToPage =(index)=> {
        if (index <= 0 || index >= this.props.size * 2) {
            return
        }
        const date = moment(this.props.initDate).add(index - this.props.size, 'days')
        this.refs.calendar.scrollToIndex({index, animated: false})
        this.setState({index, date})
    }

    render() {
        const {width, virtualizedListProps, events, initDate, isWeekly, formatHeader} = this.props;
        return (
            <View style={[this.styles.container, {width}]}>

                <VirtualizedList
                    ref='calendar'
                    windowSize={2}
                    initialNumToRender={2}
                    initialScrollIndex={this.props.size}
                    data={events}
                    getItemCount={() => this.props.size * 2}
                    getItem={this._getItem.bind(this)}
                    keyExtractor={(item, index) => index}
                    getItemLayout={this._getItemLayout.bind(this)}
                    horizontal
                    pagingEnabled
                    renderItem={this._renderItem.bind(this)}
                    // style={{width: width}}
                    onMomentumScrollEnd={(event) => {
                        const index = parseInt(event.nativeEvent.contentOffset.x / width)
                        const date = moment(this.props.initDate).add(index - this.props.size, 'days')
                        this.setState({index, date})
                    }}
                    scrollEnabled = {false}
                    {...virtualizedListProps}
                />
            </View>

        )
    }
}
