import * as React from 'react';
import classnames = require('classnames');
import { ContextNaturalKey, IdentifiableObject, Permissible, UserProfile, IPrivacy, ContextPrivacy, ElasticSearchType } from '../../../types/intrasocial_types';
import { ReduxState } from '../../../redux';
import { AuthenticationManager } from '../../../managers/AuthenticationManager';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { translate } from '../../../localization/AutoIntlProvider';
type OwnProps = {
    
    contextNaturalKey:ContextNaturalKey
    contextObject:IdentifiableObject & Permissible & IPrivacy
}
type ReduxStateProps = {
    authenticatedUser:UserProfile
}
type DefaultProps = {
}
type State = {
}
type Props = OwnProps & DefaultProps & ReduxStateProps
export class ContextMembershipComponent extends React.Component<Props, State> {
    static defaultProps:DefaultProps = {
        
    }
    constructor(props:Props) {
        super(props);
        this.state = {

        }
    }
    join = () => {

    }
    requestJoin = () => {
        
    }
    isMemberOfContext = () => {
        const {authenticatedUser, contextNaturalKey, contextObject} = this.props
        return ContextNaturalKey.getMembers(contextNaturalKey, contextObject).contains(authenticatedUser.id)
    }
    renderRequestJoin = () => {
        const {contextNaturalKey} = this.props
        const key = ElasticSearchType.nameSingularForKey(ContextNaturalKey.elasticTypeForKey(contextNaturalKey))
        return <Button onClick={this.requestJoin}>{translate("context.request.join").format(key)}</Button>
    }
    renderJoin = () => {
        const {contextNaturalKey} = this.props
        const key = ElasticSearchType.nameSingularForKey(ContextNaturalKey.elasticTypeForKey(contextNaturalKey))
        return <Button onClick={this.join}>{translate("context.join").format(key)}</Button>
    }
    render()
    {
        const {authenticatedUser, contextNaturalKey, contextObject} = this.props
        const isMember = this.isMemberOfContext()
        if(isMember)
            return null
        let canJoin = contextObject.privacy == ContextPrivacy.publicOpenMembership
        let canRequestJoin = contextObject.privacy == ContextPrivacy.publicClosedMembership
        return <div className="context-membership">
                {canJoin && this.renderJoin()}
                {canRequestJoin && this.renderRequestJoin()}
            </div>
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps => {

    return {
        authenticatedUser: AuthenticationManager.getAuthenticatedUser(),
    }
}
export default connect(mapStateToProps, null)(ContextMembershipComponent)