import { translate } from '../intl/AutoIntlProvider';
import * as React from 'react';
import { Button,Form, FormGroup } from 'reactstrap';
import { History} from 'history'
import * as Actions from "../../actions/Actions"
import { connect } from 'react-redux'
require("./UpdateTool.scss");
export interface Props {
    history:History,
    resetPagedData:() => void
}

class UpdateTool extends React.PureComponent<Props, {}> {
    constructor(props) {
        super(props);
        this.updateApplication = this.updateApplication.bind(this)
    }
    updateApplication()
    {
        this.props.resetPagedData();
        this.props.history.goBack();
    }
    render() {
        return(
            <div id="update-tool">
                <div className="jumbotron">
                    <div className="container">
                        <h1 className="display-4">{translate("New update")}</h1>
                        <p className="lead">{translate("A new version is available. Do you want to update now?")}</p>
                        <Form>
                            <FormGroup>
                                <Button className="margin-right-sm" onClick={this.updateApplication}>{translate("Update now")}</Button>
                                <Button onClick={this.props.history.goBack}>{translate("Go Back")}</Button>
                            </FormGroup>
                        </Form>
                    </div>
                </div>
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        resetPagedData:() => {
            dispatch(Actions.resetPagedData())
        }

    }
}
export default connect(null, mapDispatchToProps)(UpdateTool);