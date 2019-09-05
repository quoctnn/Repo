import * as React from 'react';
import { withRouter, RouteComponentProps, Link } from "react-router-dom";
import Module, { CommonModuleProps } from '../Module';
import ModuleHeader from '../ModuleHeader';
import ModuleContent from '../ModuleContent';
import ModuleFooter from '../ModuleFooter';
import ModuleMenuTrigger from '../ModuleMenuTrigger';
import "./CommunityDetailsModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { translate, lazyTranslate } from '../../localization/AutoIntlProvider';
import { Community, ContextNaturalKey, Permission, CropRect, ContextPhotoType, CropInfo, RequestErrorData } from '../../types/intrasocial_types';
import { connect } from 'react-redux';
import { ReduxState } from '../../redux';
import CircularLoadingSpinner from '../../components/general/CircularLoadingSpinner';
import LoadingSpinner from '../../components/LoadingSpinner';
import { DetailsContent } from '../../components/details/DetailsContent';
import { DetailsMembers } from '../../components/details/DetailsMembers';
import { ContextManager } from '../../managers/ContextManager';
import { Button } from 'reactstrap';
import SimpleDialog from '../../components/general/dialogs/SimpleDialog';
import FormController, { FormPageData, FormComponentType, FormStatus } from '../../components/form/FormController';
import {ApiClient, ApiClientCallback} from '../../network/ApiClient';
import classnames from 'classnames';
import { uniqueId } from '../../utilities/Utilities';
type OwnProps = {
    breakpoint:ResponsiveBreakpoint
} & CommonModuleProps
type State = {
    menuVisible:boolean
    isLoading:boolean
    editFormVisible:boolean
    editFormReloadKey?:string
    editFormStatus:FormStatus
    editFormError?:RequestErrorData
}
type ReduxStateProps = {
    community: Community
}
type ReduxDispatchProps = {
}
type Props = OwnProps & RouteComponentProps<any> & ReduxStateProps & ReduxDispatchProps
class GroupDetailsModule extends React.Component<Props, State> {
    constructor(props:Props) {
        super(props);
        this.state = {
            isLoading:false,
            menuVisible:false,
            editFormVisible:false,
            editFormStatus:FormStatus.normal,
            editFormError:null,
            editFormReloadKey:uniqueId()
        }
    }
    componentDidUpdate = (prevProps:Props) => {
        if(prevProps.breakpoint != this.props.breakpoint && this.props.breakpoint < ResponsiveBreakpoint.standard && this.state.isLoading)
        {
            this.setState({isLoading:false})
        }
    }
    menuItemClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        const visible = !this.state.menuVisible
        const newState:any = {menuVisible:visible}
        if(!visible)
        {
            /* TODO: Close the modal dialog with the group settings */
        } else {
            /* TODO: Show a modal dialog with the group settings */
        }
        this.setState(newState)
    }
    feedLoadingStateChanged = (isLoading:boolean) => {
        this.setState({isLoading})
    }
    renderLoading = () => {
        if (this.state.isLoading) {
            return (<CircularLoadingSpinner borderWidth={3} size={20} key="loading"/>)
        }
    }
    toggleEditForm = () => {
        this.setState((prevState:State) => {
            if(!prevState.editFormVisible)
                return {editFormVisible:!prevState.editFormVisible, editFormReloadKey:uniqueId()}
            return {editFormVisible:!prevState.editFormVisible, editFormError:null}
        })
    }
    renderEditButton = () => {
        return <Button onClick={this.toggleEditForm}>{translate("Edit")}</Button>
    }
    uploadContextPhoto = (type:ContextPhotoType, contextNaturalKey:ContextNaturalKey, contextObjectId:number, file:File|string, crop:CropRect, completion:ApiClientCallback<CropInfo>) => () => {
        ApiClient.setContextPhoto(type,contextNaturalKey, contextObjectId, file, crop, completion)
    }
    handleEditCommunityFormSubmit = (communityData:Partial<Community>) => {
        console.log("formdata", communityData)
        const community = this.props.community
        this.setEditFormStatus(FormStatus.submitting)
        const avatarData:{file:File|string, crop:CropRect} = communityData.avatar as any
        delete communityData["avatar"]
        const coverData:{file:File|string, crop:CropRect} = communityData.cover as any
        delete communityData["cover"]
        const completed = () => {
            if(errors.length > 0)
            {
                this.setState(() => {
                    return {editFormError:errors[0]}
                })
                this.setEditFormStatus(FormStatus.normal)
            }
            else {
                this.setEditFormStatus(FormStatus.normal)
                this.toggleEditForm()
            }
        }
        const errors:RequestErrorData[] = []
        const pushError = (error?:RequestErrorData) => {
            if(!!error)
            {
                errors.push(error)
            }
        }
        const requests:(() => void)[] = []
        let requestsCompleted = 0
        const requestCompleter = (data, status, rerror, errorData) => {
            requestsCompleted += 1
            pushError(errorData)
            if(requestsCompleted == requests.length)
            {
                completed()
            }
            else{
                const request = requests[requestsCompleted]
                request && request()
            }
        }
        requests.push(() => ApiClient.updateCommunity(this.props.community.id, communityData, requestCompleter))
        if(avatarData)
            requests.push(this.uploadContextPhoto(ContextPhotoType.avatar,ContextNaturalKey.COMMUNITY, community.id, avatarData.file, avatarData.crop, requestCompleter))
        if(coverData)
            requests.push(this.uploadContextPhoto(ContextPhotoType.cover,ContextNaturalKey.COMMUNITY, community.id, coverData.file, coverData.crop, requestCompleter))
        requests[0]() // start
    }
    setEditFormStatus = (status:FormStatus, resetError?:boolean) => {
        this.setState((prevState:State) => {
            if(prevState.editFormStatus != status)
            {
                if(resetError)
                    return {editFormStatus:status, editFormError:null}
                return {editFormStatus:status}
                
            }
        })
    }
    renderEditForm = () => {
        const community = this.props.community
        const visible = this.state.editFormVisible
        const pages:FormPageData[] = [
            {title:"Name", description:"name, description", id:"1", componentData:[
                {type:FormComponentType.text, arguments:{title:"Name", isRequired:true, id:"name", value:community.name, placeholder:"placeholder", contextNaturalKey:ContextNaturalKey.COMMUNITY, contextObjectId:community.id}},
                {type:FormComponentType.textArea, arguments:{title:"comp title2", id:"description", value:community.description, isRequired:true}}
            ] },
            {title:"Images", description:"avatar, cover", id:"2", componentData:[
                {type:FormComponentType.file, arguments:{title:"Avatar", id:"avatar", value:community.avatar, contextNaturalKey:ContextNaturalKey.COMMUNITY, contextObjectId:community.id}},
                {type:FormComponentType.file, arguments:{title:"Cover", id:"cover", value:community.cover_cropped, contextNaturalKey:ContextNaturalKey.COMMUNITY, contextObjectId:community.id}}
            ] },
        ]
        return <SimpleDialog didCancel={this.toggleEditForm} visible={visible}>
                    <FormController formError={this.state.editFormError} didCancel={this.toggleEditForm} status={this.state.editFormStatus} onFormSubmit={this.handleEditCommunityFormSubmit} title={translate("form.community.edit")} pages={pages} />
                </SimpleDialog>
    }
    render = () => {
        const {breakpoint, history, match, location, staticContext, community, contextNaturalKey, className, ...rest} = this.props
        const cn = classnames("community-details-module", className)
        return (<Module {...rest} className={cn}>
                    <ModuleHeader headerTitle={community && community.name || translate("detail.module.title")} loading={this.state.isLoading}>
                        <ModuleMenuTrigger onClick={this.menuItemClick} />
                    </ModuleHeader>
                    {breakpoint >= ResponsiveBreakpoint.standard && //do not render for small screens
                        <ModuleContent>
                            { community && community.permission >= Permission.read &&
                                <DetailsContent description={community.description}/>
                            ||
                            <LoadingSpinner key="loading"/>
                            }
                            {this.renderEditButton()}
                            {this.renderEditForm()}
                        </ModuleContent>
                    }
                    { community && community.permission >= Permission.read &&
                        <ModuleFooter className="mt-1">
                            <DetailsMembers members={community.members} />
                        </ModuleFooter>
                    }
                </Module>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps & RouteComponentProps<any>):ReduxStateProps => {

    const community = ContextManager.getContextObject(ownProps.location.pathname, ContextNaturalKey.COMMUNITY) as Community
    return {
        community,
    }
}
const mapDispatchToProps = (dispatch:ReduxState, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(GroupDetailsModule))