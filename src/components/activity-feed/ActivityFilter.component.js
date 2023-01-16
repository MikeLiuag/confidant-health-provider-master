import React, {Component} from 'react';
import {ScrollView, StyleSheet, View} from "react-native";
import {Button, ListItem, Radio, Text} from "native-base";
import Ionicon from "react-native-vector-icons/Ionicons";
import GradientButton from "../GradientButton";
import Modal from "react-native-modalbox";
import {isIphoneX} from "ch-mobile-shared";
import {FIVE_STAR_RATING, ONE_STAR_RATING} from "../../constants/CommonConstants";

export class ActivityFilter extends Component<Props> {
    constructor(props) {
        super(props);
        this.state = {
            selectedActivities: this.props.selectedActivities
        };
        this.modalRef = null;
    }

    hideFilter = () => {
        this.modalRef.close();
    };

    selectActivity = (selectedActivity) => {

        let {selectedActivities} = this.props;

        if (selectedActivity === "ALL_ACTIVITIES") {
            selectedActivities = ["ALL_ACTIVITIES"]
        }

        if (!selectedActivities.includes(selectedActivity)) {
            selectedActivities.push(selectedActivity);
        } else {
            selectedActivities = selectedActivities.filter(activity => activity !== selectedActivity);
        }
        if (selectedActivities.length === 0) {
            selectedActivities = ['ALL_ACTIVITIES'];
        } else {
            selectedActivities = selectedActivities.filter(activity => activity !== "ALL_ACTIVITIES");
        }
        this.setState({selectedActivities});
        if (this.props.updateActivityFilter) {
            this.props.updateActivityFilter(selectedActivities);

        }
    };

    render() {
        return (
            <Modal
                backdropPressToClose={true}
                backdropColor="rgba(37,52,92,0.35)"
                backdropOpacity={1}
                // onClosed={this.hideFilter}
                style={styles.modal}
                entry={"bottom"}
                position={"bottom"} ref={(ref) => {
                this.modalRef = ref;
            }} swipeArea={100}>
                <View style={{width: '100%'}}>
                    <View style={styles.filterHead}>
                        <View style={styles.swipeBar}/>
                        <Button
                            transparent
                            onPress={() => this.hideFilter(true)}
                            style={styles.arrowBtn}
                        >
                            <Ionicon name="ios-arrow-down" size={30} color="#4FACFE"/>
                        </Button>
                        <Text style={styles.filterText}>Filter Activity</Text>
                    </View>
                    <View style={styles.filterBody}>
                        <ScrollView style={styles.filterScroll}>
                            <ListItem
                                onPress={() => {
                                    this.selectActivity("ALL_ACTIVITIES")
                                }}
                                style={
                                    this.props.selectedActivities.includes("ALL_ACTIVITIES")
                                        ? [
                                            styles.multiList,
                                            {backgroundColor: 'rgba(63,178,254, 0.08)'},
                                        ]
                                        : styles.multiList
                                }
                            >
                                <Text
                                    style={
                                        this.props.selectedActivities.includes("ALL_ACTIVITIES")
                                            ? [
                                                styles.multiListText,
                                                {
                                                    fontWeight: '700',
                                                    color: '#3FB2FE',
                                                },
                                            ]
                                            : styles.multiListText
                                    }>
                                    All Activities
                                </Text>
                                <Radio
                                    style={
                                        this.props.selectedActivities.includes("ALL_ACTIVITIES")  ? styles.multiRadioSelected : styles.multiRadio
                                    }
                                    color="#3fb2fe"
                                    selectedColor="#fff"
                                    selected={this.props.selectedActivities.includes("ALL_ACTIVITIES") }
                                    onPress={() => {
                                        this.selectActivity("ALL_ACTIVITIES")
                                    }}
                                />
                            </ListItem>
                            {this.props.filterType === 'ACTIVITY' && (
                            <View>
                            <ListItem
                                onPress={() => {
                                    this.selectActivity(ONE_STAR_RATING)
                                }}
                                style={
                                    this.props.selectedActivities.includes(ONE_STAR_RATING)
                                        ? [
                                            styles.multiList,
                                            {backgroundColor: 'rgba(63,178,254, 0.08)'},
                                        ]
                                        : styles.multiList
                                }
                            >
                                <Text
                                    style={
                                        this.props.selectedActivities.includes(ONE_STAR_RATING)
                                            ? [
                                                styles.multiListText,
                                                {
                                                    fontWeight: '700',
                                                    color: '#3FB2FE',
                                                },
                                            ]
                                            : styles.multiListText
                                    }>
                                    Only 1 Star Reviews
                                </Text>
                                <Radio
                                    style={
                                        this.props.selectedActivities.includes(ONE_STAR_RATING)  ? styles.multiRadioSelected : styles.multiRadio
                                    }
                                    color="#3fb2fe"
                                    selectedColor="#fff"
                                    selected={this.props.selectedActivities.includes(ONE_STAR_RATING) }
                                    onPress={() => {
                                        this.selectActivity(ONE_STAR_RATING)
                                    }}
                                />
                            </ListItem>
                            <ListItem
                                onPress={() => {
                                    this.selectActivity(FIVE_STAR_RATING)
                                }}
                                style={
                                    this.props.selectedActivities.includes(FIVE_STAR_RATING)
                                        ? [
                                            styles.multiList,
                                            {backgroundColor: 'rgba(63,178,254, 0.08)'},
                                        ]
                                        : styles.multiList
                                }
                            >
                                <Text
                                    style={
                                        this.props.selectedActivities.includes(FIVE_STAR_RATING)
                                            ? [
                                                styles.multiListText,
                                                {
                                                    fontWeight: '700',
                                                    color: '#3FB2FE',
                                                },
                                            ]
                                            : styles.multiListText
                                    }>
                                    Only 5 Star Reviews
                                </Text>
                                <Radio
                                    style={
                                        this.props.selectedActivities.includes(FIVE_STAR_RATING)  ? styles.multiRadioSelected : styles.multiRadio
                                    }
                                    color="#3fb2fe"
                                    selectedColor="#fff"
                                    selected={this.props.selectedActivities.includes(FIVE_STAR_RATING) }
                                    onPress={() => {
                                        this.selectActivity(FIVE_STAR_RATING)
                                    }}
                                />
                            </ListItem>
                            <ListItem
                                onPress={() => {
                                    this.selectActivity("WROTE_SESSION_NOTES")
                                }}
                                style={
                                    this.props.selectedActivities.includes("WROTE_SESSION_NOTES")
                                        ? [
                                            styles.multiList,
                                            {backgroundColor: 'rgba(63,178,254, 0.08)'},
                                        ]
                                        : styles.multiList
                                }
                            >
                                <Text
                                    style={
                                        this.props.selectedActivities.includes("WROTE_SESSION_NOTES")
                                            ? [
                                                styles.multiListText,
                                                {
                                                    fontWeight: '700',
                                                    color: '#3FB2FE',
                                                },
                                            ]
                                            : styles.multiListText
                                    }>
                                    Only Session Notes
                                </Text>
                                <Radio
                                    style={
                                        this.props.selectedActivities.includes("WROTE_SESSION_NOTES")  ? styles.multiRadioSelected : styles.multiRadio
                                    }
                                    color="#3fb2fe"
                                    selectedColor="#fff"
                                    selected={this.props.selectedActivities.includes("WROTE_SESSION_NOTES") }
                                    onPress={() => {
                                        this.selectActivity("WROTE_SESSION_NOTES")
                                    }}
                                />
                            </ListItem>
                            <ListItem
                                onPress={() => {
                                    this.selectActivity("ASKED_QUESTION")
                                }}
                                style={
                                    this.props.selectedActivities.includes("ASKED_QUESTION")
                                        ? [
                                            styles.multiList,
                                            {backgroundColor: 'rgba(63,178,254, 0.08)'},
                                        ]
                                        : styles.multiList
                                }
                            >
                                <Text
                                    style={
                                        this.props.selectedActivities.includes("ASKED_QUESTION")
                                            ? [
                                                styles.multiListText,
                                                {
                                                    fontWeight: '700',
                                                    color: '#3FB2FE',
                                                },
                                            ]
                                            : styles.multiListText
                                    }>
                                    Only Questions
                                </Text>
                                <Radio
                                    style={
                                        this.props.selectedActivities.includes("ASKED_QUESTION")  ? styles.multiRadioSelected : styles.multiRadio
                                    }
                                    color="#3fb2fe"
                                    selectedColor="#fff"
                                    selected={this.props.selectedActivities.includes("ASKED_QUESTION") }
                                    onPress={() => {
                                        this.selectActivity("ASKED_QUESTION")
                                    }}
                                />
                            </ListItem>
                                </View>
                            )}
                            <ListItem
                                onPress={() => {
                                    this.selectActivity("SCHEDULED_APPOINTMENT")
                                }}
                                style={
                                    this.props.selectedActivities.includes("SCHEDULED_APPOINTMENT")
                                        ? [
                                            styles.multiList,
                                            {backgroundColor: 'rgba(63,178,254, 0.08)'},
                                        ]
                                        : styles.multiList
                                }
                            >
                                <Text
                                    style={
                                        this.props.selectedActivities.includes("SCHEDULED_APPOINTMENT")
                                            ? [
                                                styles.multiListText,
                                                {
                                                    fontWeight: '700',
                                                    color: '#3FB2FE',
                                                },
                                            ]
                                            : styles.multiListText
                                    }>
                                    Recaps for Scheduled Appointments
                                </Text>
                                <Radio
                                    style={
                                        this.props.selectedActivities.includes("SCHEDULED_APPOINTMENT")  ? styles.multiRadioSelected : styles.multiRadio
                                    }
                                    color="#3fb2fe"
                                    selectedColor="#fff"
                                    selected={this.props.selectedActivities.includes("SCHEDULED_APPOINTMENT") }
                                    onPress={() => {
                                        this.selectActivity("SCHEDULED_APPOINTMENT")
                                    }}
                                />
                            </ListItem>
                            <ListItem
                                onPress={() => {
                                    this.selectActivity("COMPLETED_APPOINTMENT")
                                }}
                                style={
                                    this.props.selectedActivities.includes("COMPLETED_APPOINTMENT")
                                        ? [
                                            styles.multiList,
                                            {backgroundColor: 'rgba(63,178,254, 0.08)'},
                                        ]
                                        : styles.multiList
                                }
                            >
                                <Text
                                    style={
                                        this.props.selectedActivities.includes("COMPLETED_APPOINTMENT")
                                            ? [
                                                styles.multiListText,
                                                {
                                                    fontWeight: '700',
                                                    color: '#3FB2FE',
                                                },
                                            ]
                                            : styles.multiListText
                                    }>
                                    Recaps for Completed Appointments
                                </Text>
                                <Radio
                                    style={
                                        this.props.selectedActivities.includes("COMPLETED_APPOINTMENT")  ? styles.multiRadioSelected : styles.multiRadio
                                    }
                                    color="#3fb2fe"
                                    selectedColor="#fff"
                                    selected={this.props.selectedActivities.includes("COMPLETED_APPOINTMENT") }
                                    onPress={() => {
                                        this.selectActivity("COMPLETED_APPOINTMENT")
                                    }}
                                />
                            </ListItem>
                            <ListItem
                                onPress={() => {
                                    this.selectActivity("COMPLETED_CONVERSATION")
                                }}
                                style={
                                    this.props.selectedActivities.includes("COMPLETED_CONVERSATION")
                                        ? [
                                            styles.multiList,
                                            {backgroundColor: 'rgba(63,178,254, 0.08)'},
                                        ]
                                        : styles.multiList
                                }
                            >
                                <Text
                                    style={
                                        this.props.selectedActivities.includes("COMPLETED_CONVERSATION")
                                            ? [
                                                styles.multiListText,
                                                {
                                                    fontWeight: '700',
                                                    color: '#3FB2FE',
                                                },
                                            ]
                                            : styles.multiListText
                                    }>
                                    Recaps for Completed Conversations
                                </Text>
                                <Radio
                                    style={
                                        this.props.selectedActivities.includes("COMPLETED_CONVERSATION")  ? styles.multiRadioSelected : styles.multiRadio
                                    }
                                    color="#3fb2fe"
                                    selectedColor="#fff"
                                    selected={this.props.selectedActivities.includes("COMPLETED_CONVERSATION") }
                                    onPress={() => {
                                        this.selectActivity("COMPLETED_CONVERSATION")
                                    }}
                                />
                            </ListItem>
                            {this.props.filterType === 'REPORTS' && (
                            <ListItem
                                onPress={() => {
                                    this.selectActivity("READ_EDUCATION")
                                }}
                                style={
                                    this.props.selectedActivities.includes("READ_EDUCATION")
                                        ? [
                                            styles.multiList,
                                            {backgroundColor: 'rgba(63,178,254, 0.08)'},
                                        ]
                                        : styles.multiList
                                }
                            >
                                <Text
                                    style={
                                        this.props.selectedActivities.includes("READ_EDUCATION")
                                            ? [
                                                styles.multiListText,
                                                {
                                                    fontWeight: '700',
                                                    color: '#3FB2FE',
                                                },
                                            ]
                                            : styles.multiListText
                                    }>
                                    Recaps for Read Education Articles
                                </Text>
                                <Radio
                                    style={
                                        this.props.selectedActivities.includes("READ_EDUCATION")  ? styles.multiRadioSelected : styles.multiRadio
                                    }
                                    color="#3fb2fe"
                                    selectedColor="#fff"
                                    selected={this.props.selectedActivities.includes("READ_EDUCATION") }
                                    onPress={() => {
                                        this.selectActivity("READ_EDUCATION")
                                    }}
                                />
                            </ListItem>
                            )}

                        </ScrollView>
                        <View style={styles.filterBtn}>
                            <GradientButton
                                onPress={() => this.hideFilter()}
                                disabled={this.props.selectedActivities.length === 0}
                                text="Close"
                            />
                        </View>
                    </View>

                </View>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
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

});

