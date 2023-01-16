import { connect } from "react-redux";
import { chatActionCreators } from "./actions";

function mapStateToProps({ chat, auth , connections, appointments,profile}) {
    return {
        chat, auth, connections, appointments,profile
    };
}

export function connectChatWithAuth(configMapStateToProps = mapStateToProps) {
    return connect(
        configMapStateToProps,
        chatActionCreators
    );
}
