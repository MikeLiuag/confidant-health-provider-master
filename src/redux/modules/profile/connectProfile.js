import {connect} from "react-redux";
import {profileActionCreators} from "./actions";
import {connectActionCreators} from "../connections/actions";

function mapStateToProps({profile,connections,appointments}) {
    return {
        profile,
        connections,
        appointments
    };
}

const mapDispatchToProps = {...profileActionCreators,...connectActionCreators};

export function connectProfile(configMapStateToProps = mapStateToProps) {
    return connect(
        configMapStateToProps,
        mapDispatchToProps
    );
}