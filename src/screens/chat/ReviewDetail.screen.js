import React, {Component} from 'react';
import { StatusBar} from 'react-native';
import {AlertUtil, ReviewSeeAllComponent} from 'ch-mobile-shared';
import ProfileService from '../../services/ProfileService';


export default class ReviewDetailScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        const providerInfo = navigation.getParam('providerInfo', null);
        const feedbackSummary = navigation.getParam('feedbackSummary', null);

        this.state = {
            isLoading: false,
            providerInfo: providerInfo,
            feedbackSummary: feedbackSummary,
            reviewDetails: null,
            currentPage: 0,
            hasMore: true,
            isLoadingMore: null,
        };
    }

    goBack = () => {
        this.props.navigation.goBack();
    };

    getReviewDetails = async isLazy => {
        isLazy
            ? this.setState({isLoadingMore: true})
            : this.setState({isLoading: true});
        const reviewDetails = await ProfileService.getProviderFeedback(
            this.state.providerInfo.userId,
            this.state.currentPage,
        );
        console.log("reviewDetails")
        console.log(reviewDetails)
        if (reviewDetails.errors) {
            console.warn(reviewDetails.errors[0].endUserMessage);
            if (reviewDetails.errors[0].errorCode !== ERROR_NOT_FOUND) {
                AlertUtil.showErrorMessage(reviewDetails.errors[0].endUserMessage);
            }
        } else {
            const currentpage = reviewDetails.currentPage;
            const totalpages = reviewDetails.totalPages;
            const nextReviews = reviewDetails.feedbackList;

            this.setState({
                reviewDetails: this.state.reviewDetails
                    ? [...this.state.reviewDetails, ...nextReviews]
                    : [...nextReviews],
                hasMore: currentpage < totalpages - 1,
                currentPage: this.state.hasMore ? currentpage + 1 : currentpage,
                isLoading: false,
                isLoadingMore: false,
            });
        }
    };

    componentWillMount = async () => {
        console.log(this.state.providerInfo)
        await this.getReviewDetails();
    };

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('light-content', true);

        return (
            <ReviewSeeAllComponent
                isLoading={this.state.isLoading}
                isLoadingMore={this.state.isLoadingMore}
                hasMore={this.state.hasMore}
                providerInfo={this.state.providerInfo}
                feedbackSummary={this.state.feedbackSummary}
                reviewDetails={this.state.reviewDetails}
                getReviewDetails={this.getReviewDetails}
                goBack={this.goBack}
            />
        );
    }
}
