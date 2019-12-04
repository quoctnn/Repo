import * as React from "react";
import { ReduxState } from "../../../../redux";
import { connect } from 'react-redux';
import { availableEndpoints, setEndpointAction } from '../../../../redux/endpoint';
import { AuthenticationManager } from '../../../../managers/AuthenticationManager';
import { translate } from '../../../../localization/AutoIntlProvider';

type ReduxStateProps = {
    endpoint: number;
}

type ReduxDispatchProps = {
    setApiEndpoint?: (index: number) => void;
}

type Props = ReduxStateProps & ReduxDispatchProps
class EndpointSelector extends React.PureComponent<Props, {}> {
    constructor(props: Props) {
        super(props)
    }

    render() {
        return (
            <div className={"d-flex settings-item endpoint-selector"}>
                <div className="settings-item-title flex-grow-1">{translate("Api Endpoint")}</div>
                <div className="dropdown">
                    <button
                    className="btn btn-secondary dropdown-toggle text-truncate"
                    type="button"
                    id="dropdownMenuButton"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                    >
                    { availableEndpoints[this.props.endpoint].endpoint}
                    </button>

                    <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    {availableEndpoints.map((endpoint, index) => {
                        return (
                        <a
                            key={index}
                            onClick={() => {
                            this.props.setApiEndpoint(index);
                            }}
                            className="dropdown-item"
                            href="#"
                        >
                            {endpoint.endpoint}
                        </a>
                        );
                    })}
                    </div>
                </div>
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

export default connect<ReduxStateProps, ReduxDispatchProps, {}>(mapStateToProps, mapDispatchToProps)(EndpointSelector);
