import * as React from 'react';
import { ContextNaturalKey, UserProfile } from '../types/intrasocial_types';
import { ReduxState } from '../redux';
import { connect } from 'react-redux';
import { ContextManager } from '../managers/ContextManager';
type ReduxStateProps<T> = {
    object:T
}
type OwnProps<T> = 
{
    objectId:number
    render:(object:T) => React.ReactNode
    contextNaturalKey:ContextNaturalKey
}
type Props<T> = OwnProps<T> & ReduxStateProps<T>
type State<T> = {
    object:T
}
class GenericConnectedContextObject<T> extends React.Component<Props<T>,State<T>> {
    constructor(props:Props<T>) {
      super(props);
    }
    componentDidMount = () => {
        if(!this.props.object)
            ContextManager.ensureObjectExists(this.props.contextNaturalKey, this.props.objectId)
    }
    shouldComponentUpdate = (prevProps:Props<T>, prevState:State<T>) => {
        return prevState.object != this.state.object
    }
    static getDerivedStateFromProps<T>(props: Props<T>, state: State<T>): Partial<State<T>>{
        return {object:props.object}
    }
    render() {
        if(!this.state.object)
            return <div>Loading</div>
        return this.props.render(this.state.object)
    }
}
const mapStateToProps = (state: ReduxState, ownProps: OwnProps<UserProfile>): ReduxStateProps<UserProfile> => {
    return {
        object: ContextManager.getStoreObject(ownProps.contextNaturalKey, ownProps.objectId) as any as UserProfile
    }
}
export default connect(mapStateToProps)(GenericConnectedContextObject as new(props: OwnProps<UserProfile>) => GenericConnectedContextObject<UserProfile>)