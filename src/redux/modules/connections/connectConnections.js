import { connect } from "react-redux";
import { connectActionCreators } from "./actions";

function mapStateToProps({ connections, profile, auth,settings,chat, appointments}) {
    return {
        connections, profile, auth,settings, chat, appointments
    };
}

const mapDispatchToProps = connectActionCreators;

export function connectConnections(configMapStateToProps = mapStateToProps) {
    return connect(
        configMapStateToProps,
        mapDispatchToProps
    );
}
