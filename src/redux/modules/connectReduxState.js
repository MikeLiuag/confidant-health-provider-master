import {connect} from "react-redux";

function mapStateToProps({ auth, profile, settings, appointments, connections,chat, educational }) {
    return {
        auth,
        profile,
        settings,
        appointments,
        connections,
        chat,
        educational
    };
}


export function connectReduxState(configMapStateToProps = mapStateToProps) {
    return connect(
        configMapStateToProps,
        null
    );
}
