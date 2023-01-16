import React, {Component} from 'react';
import {FlatList, StatusBar, StyleSheet} from 'react-native';
import {Accordion, Container, Content, Header, Icon, Text, View} from 'native-base';
import {
    addTestID,
    AlertUtil,
    Colors,
    CommonStyles, ContentLoader,
    getHeaderHeight,
    isIphoneX,
    PrimaryButton,
    SingleCheckListItem,
    SliderSearch,
    TextStyles
} from 'ch-mobile-shared';
import {Screens} from '../../constants/Screens';
import ConversationService from "../../services/ConversationService";
import Loader from "../../components/Loader";

const HEADER_SIZE = getHeaderHeight();

export default class DomainGroupsScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.domainType = navigation.getParam('domainType', null);
        this.state = {
            domainGroups: [],
            isLoading: true,
            selectedElements: [],
            searchQuery: '',
            searchedDomainElements: [],
        };
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };


    navigateToNextScreen = () => {
        this.props.navigation.navigate(Screens.ASSIGN_DOMAIN_ELEMENT_SCREEN, {
            selectedElements: this.state.selectedElements,
            selectedType: this.domainType,
            ...this.props.navigation.state.params,
        });
    };

    componentDidMount() {
        this.getDomainGroups();
    }

    getDomainGroups = async () => {
        try {
            const response = await ConversationService.getDomainGroupsByTypeId(this.domainType.typeId);
            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                this.backClicked();
            } else {
                if (response.length === 0) {
                    this.getDomainElements();
                } else {
                    this.setState({domainGroups: response, isLoading: false})
                }

            }
        } catch (e) {
            console.log(e)
        }

    }
    getDomainElements = async () => {
        try {
            const response = await ConversationService.getDomainElementsByTypeId(this.domainType.typeId);
            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                this.backClicked();
            } else {
                this.setState({domainElements: response.elements, isLoading: false})
            }
        } catch (e) {
            console.log(e)
        }

    }

    _renderHeader = (domainGroup, expanded) => {
        const {selectedElements} = this.state;
        const selectedElementIds = selectedElements.map(el => el.Id);
        const selectedCount = domainGroup.relatedElements.reduce((prev, current) => {
            if (selectedElementIds.includes(current.Id)) {
                prev++;
            }
            return prev;
        }, 0);
        return (
            <View style={{
                flexDirection: "row",
                padding: 24,
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: Colors.colors.white
            }}>
                <View style={styles.headTextWrap}>
                    <Text style={styles.headMainText}>{domainGroup.name}</Text>
                    <Text style={styles.selectedText}>{selectedCount} selected</Text>
                </View>
                {expanded
                    ? <Icon type={'SimpleLineIcons'} style={{fontSize: 22}} name="arrow-up"/>
                    : <Icon type={'SimpleLineIcons'} style={{fontSize: 22}} name="arrow-down"/>}
            </View>
        );
    };


    updateList = (item, selectedElements, selectedElementIds) => {
        if (selectedElementIds.includes(item.Id)) {
            selectedElements = selectedElements.filter(el => el.Id !== item.Id);
        } else {
            selectedElements.push(item);
        }
        this.setState({
            selectedElements
        });

    }

    _renderContent = (domainGroup, index) => {
        let {selectedElements} = this.state;
        const selectedElementIds = selectedElements.map(element => element.Id);
        return (
            <View style={{marginBottom: 8}}>
                <FlatList
                    data={domainGroup.relatedElements}
                    renderItem={({item, index}) => {
                        return (<SingleCheckListItem
                            listTestId={'list - ' + index + 1}
                            checkTestId={'checkbox - ' + index + 1}
                            keyId={index}
                            listPress={() => this.updateList(item, selectedElements, selectedElementIds)}
                            itemSelected={selectedElementIds.includes(item.Id)}
                            itemTitle={item.name}
                        />);
                    }}
                    keyExtractor={item => item.id}
                />
            </View>
        );
    }

    propagate = result => {
        if(result.searchedDomainElements) {
            this.setState({
                searchedDomainElements: result.searchedDomainElements
            });
        }else{
            this.setState({
                searchQuery: '',
                searchedDomainElements: []
            });
        }
    };


    render() {
        StatusBar.setBarStyle('dark-content', true);
        const {domainGroups, domainElements, selectedElements, searchQuery, searchedDomainElements} = this.state;
        let filteredDomainElements= domainElements
        if (searchQuery !== '' && searchedDomainElements && searchedDomainElements.length> 0) {
            filteredDomainElements = searchedDomainElements
        }

        const selectedElementIds = selectedElements.map(element => element.Id);
        return (
            <Container style={{backgroundColor: Colors.colors.screenBG}}>
                <Header transparent noShadow={false}
                        style={styles.headerWrap}>
                    <StatusBar
                        backgroundColor="transparent"
                        barStyle="dark-content"
                        translucent
                    />
                    <SliderSearch
                        options={{
                            screenTitle: '',
                            searchFieldPlaceholder: 'Search elements',
                            listItems: {
                                filteredElements: this.state.domainElements?this.state.domainElements: this.state.domainGroups?.flatMap(item=>item.relatedElements),
                            },
                            filter: (listItems, query) => {
                                this.setState({searchQuery: query});
                                console.log('listItems', listItems)
                                const filteredElements = listItems.filteredElements.filter(element =>
                                    element.name
                                        .toLowerCase()
                                        .includes(query.toLowerCase().trim()),
                                );
                                return {
                                    searchedDomainElements: filteredElements,
                                };
                            },
                            showBack:true,
                            backClicked: this.backClicked,
                        }}
                        propagate={this.propagate}/>
                </Header>
                <Content>
                    <View style={styles.titleWrap}>
                        <Text style={{...CommonStyles.styles.commonAptHeader}}>
                            Select {this.domainType.typeName} you want to add
                        </Text>
                    </View>

                    {
                        this.state.isLoading && <ContentLoader numItems={7} type={'checklist'}/>
                    }
                    {(!searchQuery && domainGroups.length > 0) ?
                        (<View style={styles.sectionWrapper}>
                                <Accordion
                                    dataArray={domainGroups}
                                    animation={true}
                                    // expanded={0}
                                    style={{borderTopColor: Colors.colors.borderColor, marginBottom: 8}}
                                    renderHeader={this._renderHeader}
                                    renderContent={this._renderContent}
                                />
                            </View>
                        ) : (
                            <View style={styles.sectionWrapper}>
                                {
                                    filteredDomainElements && filteredDomainElements.map((element, index) =>
                                        <SingleCheckListItem
                                            listTestId={'list - ' + 1}
                                            checkTestId={'checkbox - ' + index + 1}
                                            keyId={index}
                                            listPress={() => this.updateList(element, selectedElements, selectedElementIds)}
                                            itemSelected={selectedElementIds.includes(element.Id)}
                                            itemTitle={element.name}
                                        />)
                                }
                            </View>
                        )
                    }

                </Content>

                <View
                    {...addTestID('view')}
                    style={styles.greBtn}>
                    <PrimaryButton
                        testId="continue"
                        onPress={() => {
                            this.navigateToNextScreen();
                        }}
                        disabled={selectedElementIds.length === 0}
                        text="Continue"
                    />
                </View>

            </Container>
        );
    }
}

const styles = StyleSheet.create({
    headerWrap: {
        paddingLeft: 18,
        paddingRight: 18,
        height: HEADER_SIZE,
        ...CommonStyles.styles.headerShadow
    },
    backButton: {
        width: 35,
        paddingLeft: 0,
        paddingRight: 0
    },
    titleWrap: {
        alignItems: 'center',
        marginBottom: 16,
        paddingLeft: 24,
        paddingRight: 24
    },
    sectionWrapper: {
        marginBottom: 60,
        paddingHorizontal: 24
    },
    headTextWrap: {},
    headMainText: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.subTextM,
        ...TextStyles.mediaTexts.manropeBold,
        marginBottom: 4
    },
    selectedText: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeMedium
    },
    singleDomainItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: Colors.colors.highContrastBG,
        paddingTop: 16,
        paddingBottom: 16
    },
    domainInfo: {
        flex: 1
    },
    domainStatus: {
        color: Colors.colors.primaryText,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeBold
    },
    domainTitle: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.bodyTextS,
        ...TextStyles.mediaTexts.manropeMedium
    },
    domainIcon: {},
    greBtn: {
        padding: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
        ...CommonStyles.styles.stickyShadow
    }
});
