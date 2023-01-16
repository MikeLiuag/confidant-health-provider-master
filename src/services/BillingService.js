import {HttpClient} from "ch-mobile-shared";
import {ApiEndpoints} from './../constants/ApiEndpoints'

export default class BillingService {


    static async connectToStripe() {
        return HttpClient.getInstance().request(
            ApiEndpoints.ONBOARD_STRIPE_CONNECT
        );
    }

    static async getStripeConnectDetails() {
        return HttpClient.getInstance().request(
            ApiEndpoints.GET_STRIPE_CONNECT_DETAILS
        );
    }


}
