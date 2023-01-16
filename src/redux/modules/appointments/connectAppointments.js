import { connect } from "react-redux";
import { appointmentsActionCreators} from "./actions";
import {profileActionCreators} from "../profile";

function mapStateToProps({ appointments, auth,connections, settings,profile}) {
    return {
        appointments, auth, connections, settings,profile
    };
}

const mapDispatchToProps = {...appointmentsActionCreators,...profileActionCreators};

export function connectAppointments(configMapStateToProps = mapStateToProps) {
    return connect(
        configMapStateToProps,
        mapDispatchToProps
    );
}
