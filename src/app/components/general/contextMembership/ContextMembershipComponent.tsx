import * as React from 'react';
import { ContextNaturalKey, IdentifiableObject, Permissible, UserProfile, IPrivacy, ContextPrivacy, ElasticSearchType, IMembershipStatus } from '../../../types/intrasocial_types';
import { ReduxState } from '../../../redux';
import { AuthenticationManager } from '../../../managers/AuthenticationManager';
import { connect } from 'react-redux';
import { Button, Alert } from 'reactstrap';
import { translate } from '../../../localization/AutoIntlProvider';
import { ApiClient } from '../../../network/ApiClient';
import { ToastManager } from '../../../managers/ToastManager';
import { CommunityManager } from '../../../managers/CommunityManager';
import "./ContextMembershipComponent.scss"
import { GroupController } from '../../../managers/GroupController';
import { EventController } from '../../../managers/EventController';
type OwnProps = {
    
    contextNaturalKey:ContextNaturalKey
    contextObject:IdentifiableObject & Permissible & IPrivacy & IMembershipStatus
}
type ReduxStateProps = {
    authenticatedUser:UserProfile
}
type DefaultProps = {
}
type State = {
}
type Props = OwnProps & DefaultProps & ReduxStateProps
class ContextMembershipComponent extends React.Component<Props, State> {
    static defaultProps:DefaultProps = {
        
    }
    constructor(props:Props) {
        super(props);
        this.state = {

        }
    }
    updateContextObject = (object:Partial<IMembershipStatus> & IdentifiableObject) => {
        const {contextNaturalKey, contextObject} = this.props
        switch (contextNaturalKey) {
            case ContextNaturalKey.COMMUNITY:CommunityManager.updateCommunityObject(object)
            case ContextNaturalKey.GROUP:GroupController.partialUpdate(object)
            case ContextNaturalKey.EVENT:EventController.partialUpdate(object)
            default:
                break;
        }
    }
    acceptInvitation = () => {
        const {contextNaturalKey, contextObject} = this.props
        ApiClient.joinContext(contextNaturalKey, contextObject.id, (data, status, error) => {
            ToastManager.showRequestErrorToast(error)
            if(!error)
            {
                const key = ElasticSearchType.nameSingularForKey(ContextNaturalKey.elasticTypeForKey(contextNaturalKey)).toLowerCase()
                ToastManager.showInfoToast(translate("context.joined.format").format(key) )
                this.updateContextObject({pending:false, invited:false, id:contextObject.id})
            }
        })
    }
    requestJoin = () => {
        const {contextNaturalKey, contextObject} = this.props
        ApiClient.createContextMembershipRequest(contextNaturalKey, contextObject.id, (data, status, error) => {
            ToastManager.showRequestErrorToast(error)
            if(!error)
            {
                this.updateContextObject({pending:true, id:contextObject.id})
            }
        })
    }
    isMemberOfContext = () => {
        const {authenticatedUser, contextNaturalKey, contextObject} = this.props
        return ContextNaturalKey.getMembers(contextNaturalKey, contextObject).contains(authenticatedUser.id)
    }
    renderPendingRequest = () => {
        return <Alert color="success"><i className="fas fa-check mr-1"></i>{translate("context.membership.request.pending")}</Alert>
    }
    renderAcceptInvitation = () => {
        return <Button color="info" onClick={this.acceptInvitation}>{translate("invitation.join")}</Button>
    }
    renderRequestJoin = () => {
        const {contextNaturalKey} = this.props
        const key = ElasticSearchType.nameSingularForKey(ContextNaturalKey.elasticTypeForKey(contextNaturalKey)).toLowerCase()
        return <Button color="info" onClick={this.requestJoin}>{translate("context.request.join.format").format(key)}</Button>
    }
    renderJoin = () => {
        const {contextNaturalKey} = this.props
        const key = ElasticSearchType.nameSingularForKey(ContextNaturalKey.elasticTypeForKey(contextNaturalKey)).toLowerCase()
        return <Button color="info" onClick={this.acceptInvitation}>{translate("context.join.format").format(key)}</Button>
    }
    render()
    {
        const {contextObject} = this.props
        const isMember = this.isMemberOfContext()
        if(isMember)
            return null
        const isInvited = contextObject.invited
        const hasPendingRequest = !isInvited && contextObject.pending
        const hasMembershipStatus = isInvited || hasPendingRequest
        let canJoin = isInvited || (!hasMembershipStatus && contextObject.privacy == ContextPrivacy.publicOpenMembership)
        let canRequestJoin = !hasMembershipStatus && contextObject.privacy == ContextPrivacy.publicClosedMembership
        return <div className="context-membership">
                {hasPendingRequest && this.renderPendingRequest()}
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
export default connect<ReduxStateProps, void, OwnProps>(mapStateToProps, null)(ContextMembershipComponent)