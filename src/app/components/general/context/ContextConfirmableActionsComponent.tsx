
import * as React from 'react';
import { ContextNaturalKey, Linkable, IdentifiableObject, Permissible, ElasticSearchType } from '../../../types/intrasocial_types';
import { ApiClient } from '../../../network/ApiClient';
import { ToastManager } from '../../../managers/ToastManager';
import { translate } from '../../../localization/AutoIntlProvider';
import ConfirmDialog from '../dialogs/ConfirmDialog';
import { nullOrUndefined } from '../../../utilities/Utilities';
export enum ContextConfirmableActions {
    leave = "leave",
    delete = "delete",
    mute = "mute",
    unmute = "unmute",
    update = "update"
}
type ContextConfirmableProps = {
    contextNaturalKey:ContextNaturalKey
    contextObject:Linkable & IdentifiableObject & Permissible
    onActionComplete:(action:ContextConfirmableActions, contextNaturalKey:ContextNaturalKey, contextObjectId:number) => void
}
type ContextConfirmableState = {
    confirmDialogVisible:boolean
    confirmAction?:ContextConfirmableActions
}
export default class ContextConfirmableActionsComponent extends React.Component<ContextConfirmableProps, ContextConfirmableState> {
    constructor(props:ContextConfirmableProps) {
        super(props);
        this.state = {
            confirmDialogVisible:false
        }
    }
    showAction = (action:ContextConfirmableActions, needsConfirmation?:boolean) => {
        const needsConf = nullOrUndefined(needsConfirmation) ? true : needsConfirmation
        if(needsConf)
        {
            this.setState(() => {
                return {confirmDialogVisible:true, confirmAction:action}
            })
        }
        else {
            this.setState(() => {
                return {confirmDialogVisible:false, confirmAction:action}
            }, () => this.confirmationComplete(true))

        }
    }
    private closeConfirmDialog = (completedAction?:ContextConfirmableActions, contextNaturalKey?:ContextNaturalKey, contextObjectId?:number) => {

        const cb = completedAction ? () => this.props.onActionComplete(completedAction, contextNaturalKey, contextObjectId) : undefined
        this.setState(() => {
            return {confirmDialogVisible:false, confirmAction:null}
        }, cb)
    }
    private confirmationComplete = (confirmed:boolean) => {
        if(confirmed)
        {
            const id = this.props.contextObject && this.props.contextObject.id
            const contextNaturalKey = this.props.contextNaturalKey
            const action = this.state.confirmAction
            switch (action) {
                case ContextConfirmableActions.leave:
                {
                    ApiClient.leaveContext(contextNaturalKey, id, (data, status, error) => {
                        ToastManager.showRequestErrorToast(error)
                        this.closeConfirmDialog(action, contextNaturalKey, id)
                    })
                    break;
                }
                case ContextConfirmableActions.delete:
                {
                    ApiClient.deleteContext(contextNaturalKey, id, (data, status, error) => {
                        ToastManager.showRequestErrorToast(error)
                        this.closeConfirmDialog(action, contextNaturalKey, id)
                    })
                    break;
                }
                case ContextConfirmableActions.mute:
                case ContextConfirmableActions.unmute:
                {
                    const muted = action == ContextConfirmableActions.mute
                    ApiClient.muteContext(muted, contextNaturalKey, id, (data, status, error) => {
                        ToastManager.showRequestErrorToast(error)
                        this.closeConfirmDialog(action, contextNaturalKey, id)
                    })
                }
                case ContextConfirmableActions.update:
                {
                    location.reload()
                    break;
                }
                default:
                    break;
            }
        }
        else{
            this.closeConfirmDialog()
        }
    }
    private renderConfirmDialog = () => {
        const action = this.state.confirmAction
        const visible = this.state.confirmDialogVisible
        const contextName = ElasticSearchType.nameSingularForKey(ContextNaturalKey.elasticTypeForKey(this.props.contextNaturalKey)).toLowerCase()

        const title =  action && translate(`context.confirm.${this.state.confirmAction}.title.format`).format(ContextNaturalKey.nameForContextObject(this.props.contextNaturalKey, this.props.contextObject))
        const message = action && translate(`context.confirm.${this.state.confirmAction}.message.format`).format(contextName)
        const okButtonTitle = translate("common.yes")
        return <ConfirmDialog visible={visible} title={title} message={message} didComplete={this.confirmationComplete} okButtonTitle={okButtonTitle}/>
    }
    render = () => {
        return this.renderConfirmDialog()
    }
}