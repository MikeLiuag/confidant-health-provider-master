import {connect} from "react-redux";
import {chatActionCreators} from "./actions";

function mapStateToProps({chat, auth,connections}) {
    return {
        chat, auth,connections
    };
}

export function connectChat(configMapStateToProps = mapStateToProps) {
    return connect(
        configMapStateToProps,
        chatActionCreators
    );
}
