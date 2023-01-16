import {HttpClient} from "ch-mobile-shared";
import AuthStore from "../utilities/AuthStore";
import {ApiEndpoints} from "../constants/ApiEndpoints";

export default class AuthService {
    static refreshAuthToken() {
        return HttpClient.getInstance().request(ApiEndpoints.REFRESH_AUTH_TOKEN);
    }

    static login(credentials) {
        return HttpClient.getInstance().request(ApiEndpoints.PROVIDER_LOGIN, null, null, null, credentials);
    }

    static async removePlayerId(playerId) {
        return HttpClient.getInstance().request(ApiEndpoints.REMOVE_PLAYERID, playerId);
    }

    static async logout() {
        return await AuthStore.deleteAuthToken();
    }

    static async registerPlayerId(playerId) {
        return HttpClient.getInstance().request(ApiEndpoints.REGISTER_PLAYERID, {playerId}, null, null, null);
    }

    static async changePassword(params) {
        return HttpClient.getInstance().request(ApiEndpoints.CHANGE_PASSWORD, null, null, null, params);
    }

    static async userAccountRecovery(userAccountRecovery) {
        return HttpClient.getInstance().request(ApiEndpoints.USER_ACCOUNT_RECOVERY, null, null, null, userAccountRecovery);
    }

    static async verifyConfirmationCode(verifyConfirmationCode) {
        return HttpClient.getInstance().request(ApiEndpoints.VERIFY_CONFIRMATION_CODE, null, null, null, verifyConfirmationCode);
    }

    static async updatePassword(updatePassword) {
        return HttpClient.getInstance().request(ApiEndpoints.UPDATE_PASSWORD, null, null, null, updatePassword);
    }

    static async resendVerificationCode(resendVerificationCode) {
        return HttpClient.getInstance().request(ApiEndpoints.RESEND_VERIFICATION_CODE, null, null, null, resendVerificationCode)
    }

}