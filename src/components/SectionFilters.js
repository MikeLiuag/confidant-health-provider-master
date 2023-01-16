import React, {Component} from 'react';
import {Button, Text} from "native-base";
import {addTestID} from "ch-mobile-shared";
import {ScrollView, StyleSheet} from "react-native";


export class SectionFilters extends Component<Props> {

    constructor(props) {
        super(props);
        this.state = {
            filterType: this.props.initialFilterType
        }

    }

    filter = filterType => {
        this.setState({filterType: filterType});
        if(this.props.applyFilter) {
            this.props.applyFilter(filterType);
        }
    };

    render() {
        return (
            <ScrollView
                showsHorizontalScrollIndicator={false}
                horizontal
                contentContainerStyle={{
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    paddingRight: 20,
                    flex: 1
                }}
                style={styles.filtersView}>
                {this.props.showAll && (
                    <Button
                        {...addTestID('all')}
                        rounded
                        style={
                            this.state.filterType === 'ALL'
                                ? styles.filterBtnSelected
                                : styles.filterBtn
                        }
                        onPress={() => {
                            this.filter('ALL');
                        }}>
                        <Text
                            style={
                                this.state.filterType === 'ALL'
                                    ? styles.filterTextSelected
                                    : styles.filterText
                            }>
                            All
                        </Text>
                    </Button>
                )}
                {this.props.filters.map(filterType=>
                    <Button
                        key={filterType + 'btn-key'}
                        {...addTestID('filter-btn-'+filterType)}
                        rounded
                        style={
                            this.state.filterType === filterType
                                ? styles.filterBtnSelected
                                : styles.filterBtn
                        }
                        onPress={() => {
                            this.filter(filterType);
                        }}>
                        <Text
                            style={
                                this.state.filterType === filterType
                                    ? styles.filterTextSelected
                                    : styles.filterText
                            }>
                            {filterType}
                        </Text>
                    </Button>
                )}
            </ScrollView>
        );
    }

}

const styles = StyleSheet.create({
    filtersView: {
        flexGrow: 0,
        flexShrink: 0,
        flexDirection: 'row',
        flexWrap: 'nowrap',
        paddingLeft: 16,
        backgroundColor: '#ffffff',
        height: 60,
        paddingBottom: 24
    },
    filterBtn: {
        height: 32,
        borderWidth: 0.5,
        width: '40%',
        minWidth: 140,
        justifyContent: 'center',
        borderColor: '#f5f5f5',
        shadowColor: 'rgba(0,0,0,0.07)',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowRadius: 8,
        shadowOpacity: 1.0,
        elevation: 2,
        backgroundColor: '#fff',
        marginRight: 8,
        marginLeft: 8
    },
    filterText: {
        color: '#515d7d',
        fontFamily: 'Roboto-Bold',
        fontWeight: '600',
        lineHeight: 16,
        fontSize: 14,
        letterSpacing: 0.54,
        textTransform: 'capitalize'
    },
    filterBtnSelected: {
        height: 32,
        borderWidth: 0.5,
        width: '40%',
        minWidth: 140,
        justifyContent: 'center',
        borderColor: '#f5f5f5',
        shadowColor: 'rgba(0,0,0,0.07)',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowRadius: 8,
        shadowOpacity: 1.0,
        elevation: 2,
        backgroundColor: '#515d7d',
        marginRight: 8,
        marginLeft: 8
    },
    filterTextSelected: {
        color: '#FFF',
        fontFamily: 'Roboto-Bold',
        fontWeight: '600',
        lineHeight: 16,
        fontSize: 14,
        letterSpacing: 0.54,
        textTransform: 'capitalize'
    },
});
