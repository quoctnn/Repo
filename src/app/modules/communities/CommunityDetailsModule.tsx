import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import Module, { CommonModuleProps } from '../Module';
import ModuleHeader from '../ModuleHeader';
import ModuleContent from '../ModuleContent';
import ModuleFooter from '../ModuleFooter';
import "./CommunityDetailsModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { translate } from '../../localization/AutoIntlProvider';
import { Community, ContextNaturalKey, Permission, CropRect, ContextPhotoType, CropInfo, RequestErrorData, ContextPrivacy, CommunityCategory, CommunityConfigurationData, CommunityCreatePermission, UserProfile } from '../../types/intrasocial_types';
import { connect } from 'react-redux';
import { ReduxState } from '../../redux';
import CircularLoadingSpinner from '../../components/general/CircularLoadingSpinner';
import LoadingSpinner from '../../components/LoadingSpinner';
import { DetailsContent } from '../../components/details/DetailsContent';
import { DetailsMembers } from '../../components/details/DetailsMembers';
import { ContextManager } from '../../managers/ContextManager';
import FormController, { FormPageData, FormStatus } from '../../components/form/FormController';
import {ApiClient, ApiClientCallback} from '../../network/ApiClient';
import classnames from 'classnames';
import { uniqueId, removeEmptyEntriesFromObject } from '../../utilities/Utilities';
import { TextInputData } from '../../components/form/components/TextInput';
import { TextAreaInputData } from '../../components/form/components/TextAreaInput';
import { ContextPhotoInputData } from '../../components/form/components/ContextPhotoInput';
import { RichRadioGroupInputData, InputOption } from '../../components/form/components/RichRadioGroupInput';
import { DropDownMenu } from '../../components/general/DropDownMenu';
import { OverflowMenuItem, OverflowMenuItemType } from '../../components/general/OverflowMenu';
import { SelectInputData } from '../../components/form/components/SelectInput';
import { ColorInputData } from '../../components/form/components/ColorInput';
import { BooleanInputData } from '../../components/form/components/BooleanInput';
import { AuthenticationManager } from '../../managers/AuthenticationManager';
type OwnProps = {
    breakpoint:ResponsiveBreakpoint
} & CommonModuleProps
type State = {
    menuVisible:boolean
    isLoading:boolean
    editFormVisible:boolean
    editFormReloadKey?:string
    editFormStatus:FormStatus
    editFormErrors?:RequestErrorData[]
    communityConfiguration?:CommunityConfigurationData
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
            editFormErrors:null,
            editFormReloadKey:uniqueId(),
            communityConfiguration:null
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
    renderLoading = () => {
        if (this.state.isLoading) {
            return (<CircularLoadingSpinner borderWidth={3} size={20} key="loading"/>)
        }
    }
    loadConfigurationDataAndShowForm = () => {
        const community = this.props.community
        ApiClient.getCommunityConfiguration(community.id, (data, status, errorData) => {
            this.setState(() => {
                return {isLoading:false, communityConfiguration:data, editFormVisible:true, editFormReloadKey:uniqueId()}
            })
        })
    }
    toggleEditForm = () => {
        const isFormVisible = this.state.editFormVisible
        if(isFormVisible) //close
        {
            this.setState(() => {
                return {editFormVisible:!isFormVisible, editFormErrors:null, communityConfiguration:null}
            })
        }
        else {
            this.setState((prevState:State) => {
                return {isLoading:true}
            }, this.loadConfigurationDataAndShowForm )
        }
        
    }
    uploadContextPhoto = (type:ContextPhotoType, contextNaturalKey:ContextNaturalKey, contextObjectId:number, file:File|string, crop:CropRect, completion:ApiClientCallback<CropInfo>) => () => {
        ApiClient.setContextPhoto(type,contextNaturalKey, contextObjectId, file, crop, completion)
    }
    handleEditCommunityFormSubmit = (communityData:Partial<Community>) => {
        console.log("formdata", communityData)
        //const hasDataToSave = Object.keys(communityData).length > 0
        const community = this.props.community
        this.setEditFormStatus(FormStatus.submitting)
        const {
            name, 
            description, 
            privacy,
            category,
            //
            avatar, 
            cover,
            //
            ...communityConfigurationData} = communityData
        const communityUpdateData = removeEmptyEntriesFromObject({name, description, privacy, category})
        const avatarData:{file:File|string, crop:CropRect} = avatar as any
        const coverData:{file:File|string, crop:CropRect} = cover as any
        const completed = () => {
            if(errors.length > 0)
            {
                this.setState(() => {
                    return {editFormErrors:errors}
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
        const requestCompleter = (data, status, errorData) => {
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
        if(Object.keys(communityUpdateData).length > 0)
            requests.push(() => ApiClient.updateCommunity(this.props.community.id, communityUpdateData, requestCompleter))
        if(avatarData)
            requests.push(this.uploadContextPhoto(ContextPhotoType.avatar,ContextNaturalKey.COMMUNITY, community.id, avatarData.file, avatarData.crop, requestCompleter))
        if(coverData)
            requests.push(this.uploadContextPhoto(ContextPhotoType.cover,ContextNaturalKey.COMMUNITY, community.id, coverData.file, coverData.crop, requestCompleter))
        if(Object.keys(communityConfigurationData).length > 0)
            requests.push(() => ApiClient.updateCommunityConfiguration(this.props.community.id, communityConfigurationData, requestCompleter))
        if(requests.length > 0)
            requests[0]() // start
        else {
            completed()
        }
    }
    setEditFormStatus = (status:FormStatus, resetError?:boolean) => {
        this.setState((prevState:State) => {
            if(prevState.editFormStatus != status)
            {
                if(resetError)
                    return {editFormStatus:status, editFormErrors:null}
                return {editFormStatus:status}
            }
        })
    }
    renderEditForm = () => {
        const community = this.props.community
        const visible = this.state.editFormVisible
        const configurationData = this.state.communityConfiguration
        const hasConfigurationData = !!configurationData
        const privacyOptions:InputOption[] = ContextPrivacy.all.map(p => {
            return {
                label:ContextPrivacy.titleForKey(p), 
                value:p, 
                description:ContextPrivacy.descriptionForKey(p),
                icon:ContextPrivacy.iconClassForKey(p),
            }
        })
        const categoryOptions:InputOption[] = CommunityCategory.all.map(p => {
            return {
                label:CommunityCategory.translationForKey(p), 
                value:p, 
            }
        })
        const communityCreateOptions:InputOption[] = CommunityCreatePermission.all.map(p => {
            return {
                label:CommunityCreatePermission.translationForKey(p), 
                value:p.toString(), 
            }
        })
        const pages:FormPageData[] = []
        if(visible){
            const primary = {title:translate("community.settings.page.title.primary"), description:translate("community.settings.page.description.primary"), id:"1", componentData:[
                new TextInputData(community.name, translate("common.name"), "name", translate("community.placeholder.name"), true),
                new TextAreaInputData(community.description, translate("common.description"), "description", null),
                new RichRadioGroupInputData(community.privacy, translate("common.privacy"), "privacy", privacyOptions, true),
                new SelectInputData(community.category,  translate("common.category"), "category", categoryOptions, null, null, true)
            ]}
            pages.push(primary)
            const appearance = {title:translate("community.settings.page.title.appearance"), description:translate("community.settings.page.description.appearance"), id:"2", componentData:[
                new ContextPhotoInputData(community.avatar, translate("common.avatar"), "avatar", ContextNaturalKey.COMMUNITY, community.id),
                new ContextPhotoInputData(community.cover, translate("common.cover"), "cover", ContextNaturalKey.COMMUNITY, community.id ),
            ]}
            if(hasConfigurationData)
            {
                appearance.componentData.push(new ColorInputData(configurationData.primary_color, translate("community.settings.title.primarycolor"), "primary_color", true))
                appearance.componentData.push(new ColorInputData(configurationData.secondary_color, translate("community.settings.title.secondarycolor"), "secondary_color", true))
            }
            pages.push(appearance)
            if(hasConfigurationData)
            {
                pages.push({title:translate("community.settings.page.title.wall"), description:translate("community.settings.page.description.wall"), id:"3", componentData:[
                    new BooleanInputData(configurationData.members_publication, translate("community.config.title.members_publication"), "members_publication", translate("community.config.description.members_publication")),
                    new BooleanInputData(configurationData.members_comments, translate("community.config.title.members_comments"), "members_comments", translate("community.config.description.members_comments")),
                    new BooleanInputData(configurationData.members_wall_notifications, translate("community.config.title.members_wall_notifications"), "members_wall_notifications", translate("community.config.description.members_wall_notifications")),
                    new BooleanInputData(configurationData.public_member_list, translate("community.config.title.public_member_list"), "public_member_list", translate("community.config.description.public_member_list")),
                    new BooleanInputData(configurationData.publish_files, translate("community.config.title.publish_files"), "publish_files", translate("community.config.description.publish_files")),
                ]})
                pages.push({title:translate("community.settings.page.title.other"), description:translate("community.settings.page.description.other"), id:"4", componentData:[
                    new SelectInputData(configurationData.members_group_creation.toString(), translate("community.config.title.members_group_creation"), "members_group_creation", communityCreateOptions, null, translate("community.config.description.members_group_creation")),
                    new SelectInputData(configurationData.subgroups.toString(), translate("community.config.title.subgroups"), "subgroups", communityCreateOptions, null, translate("community.config.description.subgroups")),
                    new SelectInputData(configurationData.members_event_creation.toString(), translate("community.config.title.members_event_creation"), "members_event_creation", communityCreateOptions, null, translate("community.config.description.members_event_creation")),
                    new SelectInputData(configurationData.members_group_creation.toString(), translate("community.config.title.members_project_creation"), "members_project_creation", communityCreateOptions, null, translate("community.config.description.members_project_creation")),
                    new BooleanInputData(configurationData.allow_anonymous_users, translate("community.config.title.allow_anonymous_users"), "allow_anonymous_users", translate("community.config.description.allow_anonymous_users")),
                ]})
            }
        }
        return <FormController key={this.state.editFormReloadKey} visible={visible} formErrors={this.state.editFormErrors} didCancel={this.toggleEditForm} status={this.state.editFormStatus} onFormSubmit={this.handleEditCommunityFormSubmit} title={translate("form.community.edit")} pages={pages} />
        
    }
    getCommunityOptions = () => {
        const options: OverflowMenuItem[] = []
        if(this.props.community.permission >= Permission.admin)
            options.push({id:"1", type:OverflowMenuItemType.option, title:translate("Edit"), onPress:this.toggleEditForm, iconClass:"fas fa-pen"})
        return options
    }
    render = () => {
        const {breakpoint, history, match, location, staticContext, community, contextNaturalKey, className, ...rest} = this.props
        const cn = classnames("community-details-module", className)
        const communityOptions = this.getCommunityOptions()
        return (<Module {...rest} className={cn}>
                    <ModuleHeader headerTitle={community && community.name || translate("detail.module.title")} loading={this.state.isLoading}>
                       {communityOptions.length > 0 && <DropDownMenu className="community-option-dropdown" triggerClass="fas fa-cog mx-1" items={communityOptions}></DropDownMenu>} 
                    </ModuleHeader>
                    {true && //breakpoint >= ResponsiveBreakpoint.standard && //do not render for small screens
                        <ModuleContent>
                            { community && community.permission >= Permission.read &&
                                <DetailsContent description={community.description}/>
                            ||
                            <LoadingSpinner key="loading"/>
                            }
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