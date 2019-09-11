import * as React from 'react';
import "./CommunityCreateComponent.scss"
import { translate } from '../../localization/AutoIntlProvider';
import { Community, ContextNaturalKey, CropRect, ContextPhotoType, CropInfo, RequestErrorData, ContextPrivacy, CommunityCategory, CommunityConfigurationData, CommunityCreatePermission } from '../../types/intrasocial_types';
import FormController, { FormPageData, FormStatus } from '../../components/form/FormController';
import {ApiClient, ApiClientCallback} from '../../network/ApiClient';
import { uniqueId, removeEmptyEntriesFromObject } from '../../utilities/Utilities';
import { TextInputData } from '../../components/form/components/TextInput';
import { TextAreaInputData } from '../../components/form/components/TextAreaInput';
import { ContextPhotoInputData } from '../../components/form/components/ContextPhotoInput';
import { RichRadioGroupInputData, InputOption } from '../../components/form/components/RichRadioGroupInput';
import { SelectInputData } from '../../components/form/components/SelectInput';
import { ColorInputData } from '../../components/form/components/ColorInput';
import { BooleanInputData } from '../../components/form/components/BooleanInput';
import { RouteComponentProps, withRouter } from 'react-router';
type OwnProps = {
}
type State = {
    formVisible:boolean
    formReloadKey?:string
    formStatus:FormStatus
    formErrors?:RequestErrorData[]
    communityConfiguration?:CommunityConfigurationData
}
type Props = OwnProps & RouteComponentProps<any>
class CommunityCreateComponent extends React.Component<Props, State> {
    constructor(props:Props) {
        super(props);
        this.state = {
            formVisible:true,
            formStatus:FormStatus.normal,
            formErrors:null,
            formReloadKey:uniqueId(),
            communityConfiguration:null
        }
    }
    back = () => {
        const goBack = () => {
            setTimeout(this.props.history.goBack, 450)
        }
        this.setState(() => {
            return { formVisible: false }
        }, goBack)
    }
    uploadContextPhoto = (type:ContextPhotoType, contextNaturalKey:ContextNaturalKey, contextObjectId:number, file:File|string, crop:CropRect, completion:ApiClientCallback<CropInfo>) => () => {
        ApiClient.setContextPhoto(type,contextNaturalKey, contextObjectId, file, crop, completion)
    }
    handleCreateCommunityFormSubmit = (communityData:Partial<Community>) => {
        console.log("formdata", communityData)
        //const hasDataToSave = Object.keys(communityData).length > 0
        this.setFormStatus(FormStatus.submitting)
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
        let createdCommunity:Community = null
        const completed = () => {
            if(errors.length > 0)
            {
                this.setState(() => {
                    return {formErrors:errors}
                })
                this.setFormStatus(FormStatus.normal)
            }
            else {
                this.setFormStatus(FormStatus.normal)
                if(createdCommunity)
                {
                    this.setState(() => {
                        return {formVisible :false}
                    }, () => {
                        window.app.navigateToRoute(createdCommunity.uri)
                    })
                    
                }
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
        ApiClient.createCommunity(communityUpdateData, (data, status, errorData) => {
            if(!errorData && data && data.id)
            {
                createdCommunity = data
                if(avatarData)
                    requests.push(this.uploadContextPhoto(ContextPhotoType.avatar,ContextNaturalKey.COMMUNITY, createdCommunity.id, avatarData.file, avatarData.crop, requestCompleter))
                if(coverData)
                    requests.push(this.uploadContextPhoto(ContextPhotoType.cover,ContextNaturalKey.COMMUNITY, createdCommunity.id, coverData.file, coverData.crop, requestCompleter))
                if(Object.keys(communityConfigurationData).length > 0)
                    requests.push(() => ApiClient.updateCommunityConfiguration(createdCommunity.id, communityConfigurationData, requestCompleter))
                if(requests.length > 0)
                    requests[0]() // start
                else {
                    completed()
                }
            }
            else 
            {
                pushError(errorData)
                completed()
            }
        })
    }
    setFormStatus = (status:FormStatus, resetError?:boolean) => {
        this.setState((prevState:State) => {
            if(prevState.formStatus != status)
            {
                if(resetError)
                    return {formStatus:status, formErrors:null}
                return {formStatus:status}
            }
        })
    }
    render = () => {
        const visible = this.state.formVisible
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
            pages.push({title:translate("community.settings.page.title.primary"), description:translate("community.settings.page.description.primary"), id:"1", componentData:[
                new TextInputData(null, translate("common.name"), "name", translate("community.placeholder.name"), true),
                new TextAreaInputData(null, translate("common.description"), "description", null),
                new RichRadioGroupInputData(null, translate("common.privacy"), "privacy", privacyOptions, true),
                new SelectInputData(null,  translate("common.category"), "category", categoryOptions, null, null, true)
            ]})
            pages.push({title:translate("community.settings.page.title.appearance"), description:translate("community.settings.page.description.appearance"), id:"2", componentData:[
                new ContextPhotoInputData(null,translate("common.avatar"), "avatar",),
                new ContextPhotoInputData(null,translate("common.cover"), "cover", ),
                new ColorInputData("#428bca", translate("community.settings.title.primarycolor"), "primary_color", true),
                new ColorInputData("#00d4ff", translate("community.settings.title.secondarycolor"), "secondary_color", true)
            ]})
            pages.push({title:translate("community.settings.page.title.wall"), description:translate("community.settings.page.description.wall"), id:"3", componentData:[
                new BooleanInputData(true, translate("community.config.title.members_publication"), "members_publication", translate("community.config.description.members_publication")),
                new BooleanInputData(true, translate("community.config.title.members_comments"), "members_comments", translate("community.config.description.members_comments")),
                new BooleanInputData(true, translate("community.config.title.members_wall_notifications"), "members_wall_notifications", translate("community.config.description.members_wall_notifications")),
                new BooleanInputData(true, translate("community.config.title.public_member_list"), "public_member_list", translate("community.config.description.public_member_list")),
                new BooleanInputData(true, translate("community.config.title.publish_files"), "publish_files", translate("community.config.description.publish_files")),
            ]})
            pages.push({title:translate("community.settings.page.title.other"), description:translate("community.settings.page.description.other"), id:"4", componentData:[
                new SelectInputData("21", translate("community.config.title.members_group_creation"), "members_group_creation", communityCreateOptions, null, translate("community.config.description.members_group_creation")),
                new SelectInputData("21", translate("community.config.title.subgroups"), "subgroups", communityCreateOptions, null, translate("community.config.description.subgroups")),
                new SelectInputData("21", translate("community.config.title.members_event_creation"), "members_event_creation", communityCreateOptions, null, translate("community.config.description.members_event_creation")),
                new SelectInputData("21", translate("community.config.title.members_project_creation"), "members_project_creation", communityCreateOptions, null, translate("community.config.description.members_project_creation")),
                new BooleanInputData(false, translate("community.config.title.allow_anonymous_users"), "allow_anonymous_users", translate("community.config.description.allow_anonymous_users")),
            ]})
        }
        return <FormController key={this.state.formReloadKey} visible={visible} formErrors={this.state.formErrors} didCancel={this.back} status={this.state.formStatus} onFormSubmit={this.handleCreateCommunityFormSubmit} title={translate("community.create")} pages={pages} />
        
    }
}
export default withRouter(CommunityCreateComponent)