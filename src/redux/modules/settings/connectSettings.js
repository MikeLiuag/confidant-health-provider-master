import { connect } from "react-redux";
import { settingsActionCreators} from "./actions";
import {appointmentsActionCreators} from "../appointments";

function mapStateToProps({ auth, profile, settings, appointments, connections,chat, educational}) {
    return {
        auth,
        settings,
        profile,
        appointments,
        connections,
        chat,
        educational
    };
}

const mapDispatchToProps = {...settingsActionCreators,...appointmentsActionCreators};

export function connectSettings(configMapStateToProps = mapStateToProps) {
    return connect(
        configMapStateToProps,
        mapDispatchToProps
    );
}
