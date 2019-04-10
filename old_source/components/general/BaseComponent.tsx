import * as React from 'react';
import { connect } from 'react-redux'
import { translate } from '../../components/intl/AutoIntlProvider';
import { RootState } from '../../reducers';
require("./BaseComponent.scss");

export interface OwnProps 
{
}
interface ReduxStateProps 
{
}
interface ReduxDispatchProps 
{
}
interface State 
{
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps
class BaseComponent extends React.Component<Props, State> {     
    static defaultProps:Props = {
    }
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    render()
    {
        return (<div id="base-component"></div>)
    }
}
const mapStateToProps = (state:RootState, ownProps: OwnProps):ReduxStateProps => {
    return {
    }
}
const mapDispatchToProps = (dispatch:any, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(BaseComponent);