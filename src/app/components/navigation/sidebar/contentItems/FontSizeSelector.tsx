import * as React from "react";
import { ReduxState } from "../../../../redux";
import { connect } from 'react-redux';
import { availableEndpoints, setEndpointAction } from '../../../../redux/endpoint';
import { AuthenticationManager } from '../../../../managers/AuthenticationManager';
import { translate } from '../../../../localization/AutoIntlProvider';
import { FontSizeAdjuster } from "../../../general/FontSizeAdjuster";

type ReduxStateProps = {
    endpoint: number;
}

type ReduxDispatchProps = {
    setApiEndpoint?: (index: number) => void;
}

type Props = ReduxStateProps & ReduxDispatchProps
class FontSizeSelector extends React.PureComponent<Props, {}> {
    constructor(props: Props) {
        super(props)
    }

    render() {
        return (
            <div className={"d-flex settings-item font-size-selector"}>
                <div className="settings-item-title flex-grow-1">{translate("Font size")}</div>
                <FontSizeAdjuster/>
            </div>
        )
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        endpoint: state.endpoint.endpoint,
    };
}

const mapDispatchToProps = dispatch => {
    return {
        setApiEndpoint: (index:number) => {
            AuthenticationManager.signOut()
            dispatch(setEndpointAction(index));
        },
    };
}

export default connect<ReduxStateProps, ReduxDispatchProps, {}>(mapStateToProps, mapDispatchToProps)(FontSizeSelector);
