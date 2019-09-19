import * as React from 'react';
import "./CommunityCreateComponent.scss"
import { translate } from '../../localization/AutoIntlProvider';
import { Community, ContextNaturalKey, CropRect, ContextPhotoType, CropInfo, RequestErrorData, ContextPrivacy, CommunityCategory, CommunityConfigurationData, CommunityCreatePermission } from '../../types/intrasocial_types';
import FormController, {  FormStatus } from '../../components/form/FormController';
import {ApiClient, ApiClientCallback} from '../../network/ApiClient';
import { uniqueId, removeEmptyEntriesFromObject, nullOrUndefined } from '../../utilities/Utilities';
import { TextInput } from '../../components/form/components/TextInput';
import { InputOption, RichRadioGroupInput } from '../../components/form/components/RichRadioGroupInput';
import { RouteComponentProps, withRouter } from 'react-router';
import { FormMenuItem } from '../../components/form/FormMenuItem';
import { FormPage } from '../../components/form/FormPage';
import { TextAreaInput } from '../../components/form/components/TextAreaInput';
import { ContextPhotoInput } from '../../components/form/components/ContextPhotoInput';
import { SelectInput } from '../../components/form/components/SelectInput';
import { ColorInput } from '../../components/form/components/ColorInput';
import { BooleanInput } from '../../components/form/components/BooleanInput';
import LoadingSpinner from '../../components/LoadingSpinner';
import { CommunityManager } from '../../managers/CommunityManager';
type OwnProps = {
    community?:Community
    communityConfiguration?:CommunityConfigurationData
    visible?:boolean
    onComplete?:() => void
}
type State = {
    formVisible:boolean
    formStatus:FormStatus
    formErrors?:RequestErrorData[]
    formValues:Partial<Community>
}
type Props = OwnProps & RouteComponentProps<any>
class CommunityCreateComponent extends React.Component<Props, State> {
    formController:FormController = null
    defaultPrimaryColor = "#428bca"
    defaultSecondaryColor = "#00d4ff"
    constructor(props:Props) {
        super(props);
        this.state = {
            formVisible:true,
            formStatus:FormStatus.normal,
            formErrors:null,
            formValues:{
            }
        }
    }

    private hasOutsideVisibilityToggle = () => {
        return !nullOrUndefined( this.props.visible)
    }
    isVisible = () => {
        if(this.hasOutsideVisibilityToggle())
            return this.props.visible
        return this.state.formVisible
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
    handleCreateCommunityFormSubmit = () => {
        const data = this.state.formValues
        const community:Partial<Community> = this.props.community || {}
        const create = !this.props.community
        console.log("formdata", data)
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
            ...communityConfigurationData} = data
        const updateData = removeEmptyEntriesFromObject({name, description, privacy, category})
        const avatarData:{file:File|string, crop:CropRect} = avatar as any
        const coverData:{file:File|string, crop:CropRect} = cover as any
        let createdCommunity:Community = null
        let primary_color = community.primary_color
        let secondary_color = community.secondary_color
        const completed = () => {
            if(!create && (primary_color != community.primary_color || secondary_color != community.secondary_color))
            {
                community.primary_color = primary_color
                community.secondary_color = secondary_color
                CommunityManager.applyCommunityTheme(community as Community)
            }
            if(errors.length > 0)
            {
                this.setState(() => {
                    return {formErrors:errors}
                })
                this.setFormStatus(FormStatus.normal)
            }
            else {
                this.setFormStatus(FormStatus.normal)
                const shouldRedirect = !!createdCommunity && createdCommunity.uri && ((create && !this.hasOutsideVisibilityToggle()) || (!create && createdCommunity.uri != community.uri))
                if(shouldRedirect)
                {
                    this.setState(() => {
                        return {formVisible :false}
                    }, () => {
                        window.app.navigateToRoute(createdCommunity.uri)
                    })
                }
                else 
                    this.didCancel()
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
            if(data && data.hasOwnProperty("primary_color"))
                primary_color = data.primary_color
            if(data && data.hasOwnProperty("secondary_color"))
                secondary_color = data.secondary_color
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
        if(create)
        {
            ApiClient.createCommunity(updateData, (data, status, errorData) => {
                if(!errorData && data && data.id)
                {
                    createdCommunity = data
                    if(!!createdCommunity)
                        CommunityManager.storeCommunities([createdCommunity])
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
        else {
            if(Object.keys(updateData).length > 0)
                requests.push(() => ApiClient.updateCommunity(this.props.community.id, updateData,(data, status, error) => {
                    createdCommunity = data
                    if(!!createdCommunity)
                        CommunityManager.storeCommunities([createdCommunity])
                    requestCompleter(data, status, error)
                }))
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
    handleValueChanged = (id:string, value:any) => {
        this.setState((prevState:State) => {
            return {formValues:{...prevState.formValues, [id]:value}}
        }, () => {
            console.log(this.state.formValues)
        })
    }
    didCancel = () => {
        if(this.props.onComplete)
            this.props.onComplete()
        else 
            this.back()
    }
    render = () => {
        const visible = this.isVisible()
        const community:Partial<Community> = this.props.community || {}
        const create = !this.props.community
        const configurationData:Partial<CommunityConfigurationData> = this.props.communityConfiguration || {}
        const hasConfigurationData = !!this.props.communityConfiguration

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
        return <FormController 
                    ref={(controller) => this.formController = controller }
                    visible={visible} 
                    formErrors={this.state.formErrors} 
                    didCancel={this.didCancel} 
                    status={this.state.formStatus} 
                    onFormSubmit={this.handleCreateCommunityFormSubmit} 
                    title={translate("community.create")} 
                    onValueChanged={this.handleValueChanged}
                    render={(form) => {
                        if(!create && !hasConfigurationData)
                        {
                            return {menuItems:[], pages:[<LoadingSpinner />]}
                        }
                        return {
                            menuItems:[
                                <FormMenuItem key="1"
                                    form={form} 
                                    pageId="1" 
                                    title={translate("community.settings.page.title.primary")} 
                                    description={translate("community.settings.page.description.primary")}  
                                    />,
                                    <FormMenuItem key="2"
                                    form={form} 
                                    pageId="2" 
                                    title={translate("community.settings.page.title.appearance")} 
                                    description={translate("community.settings.page.description.appearance")}  
                                    />,
                                    <FormMenuItem key="3"
                                    form={form} 
                                    pageId="3" 
                                    title={translate("community.settings.page.title.wall")} 
                                    description={translate("community.settings.page.description.wall")}  
                                    />,
                                    <FormMenuItem key="4"
                                    form={form} 
                                    pageId="4" 
                                    title={translate("community.settings.page.title.other")} 
                                    description={translate("community.settings.page.description.other")}  
                                    />
                            ],
                            pages:[<FormPage key="page1" form={this.formController} pageId="1" render={(pageId, form) => {
                                    return <>
                                        <TextInput 
                                        errors={form.getErrors} 
                                        isRequired={true} 
                                        hasSubmitted={form.hasSubmitted()}
                                        ref={form.setFormRef(pageId)} 
                                        onValueChanged={form.handleValueChanged(pageId)} 
                                        value={community.name} 
                                        title={translate("common.name")} 
                                        id="name" 
                                        />
                                        <TextAreaInput 
                                        errors={form.getErrors} 
                                        hasSubmitted={form.hasSubmitted()}
                                        ref={form.setFormRef(pageId)} 
                                        onValueChanged={form.handleValueChanged(pageId)} 
                                        value={community.description} 
                                        title={translate("common.description")} 
                                        id="description" 
                                        />
                                        <RichRadioGroupInput
                                            options={privacyOptions}
                                            errors={form.getErrors} 
                                            hasSubmitted={form.hasSubmitted()}
                                            ref={form.setFormRef(pageId)} 
                                            onValueChanged={form.handleValueChanged(pageId)} 
                                            value={community.privacy} 
                                            title={translate("common.privacy")} 
                                            id="privacy" 
                                            isRequired={true}
                                        />
                                        <SelectInput 
                                            options={categoryOptions}
                                            errors={form.getErrors} 
                                            hasSubmitted={form.hasSubmitted()}
                                            ref={form.setFormRef(pageId)} 
                                            onValueChanged={form.handleValueChanged(pageId)} 
                                            value={community.privacy} 
                                            title={translate("common.category")} 
                                            id="category" 
                                            isRequired={true}
                                        />
                                        </>
                            }} />,
                            <FormPage key="page2" form={this.formController} pageId="2" render={(pageId, form) => {
                                return <>
                                        <ContextPhotoInput 
                                            errors={form.getErrors} 
                                            hasSubmitted={form.hasSubmitted()}
                                            ref={form.setFormRef(pageId)} 
                                            onValueChanged={form.handleValueChanged(pageId)} 
                                            value={community.avatar} 
                                            title={translate("common.avatar")} 
                                            onRequestNavigation={form.handleRequestNavigation}
                                            contextNaturalKey={ContextNaturalKey.COMMUNITY}
                                            contextObjectId={community.id}
                                            id="avatar" 
                                        />
                                        <ContextPhotoInput 
                                            errors={form.getErrors} 
                                            hasSubmitted={form.hasSubmitted()}
                                            ref={form.setFormRef(pageId)} 
                                            onValueChanged={form.handleValueChanged(pageId)} 
                                            value={community.cover} 
                                            title={translate("common.cover")} 
                                            onRequestNavigation={form.handleRequestNavigation}
                                            contextNaturalKey={ContextNaturalKey.COMMUNITY}
                                            contextObjectId={community.id}
                                            id="cover" 
                                        />
                                        <ColorInput 
                                        errors={form.getErrors} 
                                        hasSubmitted={form.hasSubmitted()}
                                        ref={form.setFormRef(pageId)} 
                                        onValueChanged={form.handleValueChanged(pageId)} 
                                        value={configurationData.primary_color || this.defaultPrimaryColor} 
                                        title={translate("community.settings.title.primarycolor")} 
                                        onRequestNavigation={form.handleRequestNavigation}
                                        id="primary_color" 
                                        isRequired={true}
                                        />
                                        <ColorInput 
                                        errors={form.getErrors} 
                                        hasSubmitted={form.hasSubmitted()}
                                        ref={form.setFormRef(pageId)} 
                                        onValueChanged={form.handleValueChanged(pageId)} 
                                        value={configurationData.secondary_color || this.defaultSecondaryColor} 
                                        title={translate("community.settings.title.secondarycolor")} 
                                        onRequestNavigation={form.handleRequestNavigation}
                                        id="secondary_color" 
                                        isRequired={true}
                                        />
                                    </>

                        }} />,
                        <FormPage key="page3" form={this.formController} pageId="3" render={(pageId, form) => {
                            return <>
                                        <BooleanInput 
                                        errors={form.getErrors} 
                                        hasSubmitted={form.hasSubmitted()}
                                        ref={form.setFormRef(pageId)} 
                                        onValueChanged={form.handleValueChanged(pageId)} 
                                        value={create ? true : configurationData.members_publication} 
                                        title={translate("community.config.title.members_publication")} 
                                        description={translate("community.config.description.members_publication")}
                                        id="members_publication" 
                                        />
                                        <BooleanInput 
                                        errors={form.getErrors} 
                                        hasSubmitted={form.hasSubmitted()}
                                        ref={form.setFormRef(pageId)} 
                                        onValueChanged={form.handleValueChanged(pageId)} 
                                        value={create ? true : configurationData.members_comments} 
                                        title={translate("community.config.title.members_comments")} 
                                        description={translate("community.config.description.members_comments")}
                                        id="members_comments" 
                                        />
                                        <BooleanInput 
                                        errors={form.getErrors} 
                                        hasSubmitted={form.hasSubmitted()}
                                        ref={form.setFormRef(pageId)} 
                                        onValueChanged={form.handleValueChanged(pageId)} 
                                        value={create ? true : configurationData.members_wall_notifications} 
                                        title={translate("community.config.title.members_wall_notifications")} 
                                        description={translate("community.config.description.members_wall_notifications")}
                                        id="members_wall_notifications" 
                                        />
                                        <BooleanInput 
                                        errors={form.getErrors} 
                                        hasSubmitted={form.hasSubmitted()}
                                        ref={form.setFormRef(pageId)} 
                                        onValueChanged={form.handleValueChanged(pageId)} 
                                        value={create ? true : configurationData.public_member_list} 
                                        title={translate("community.config.title.public_member_list")} 
                                        description={translate("community.config.description.public_member_list")}
                                        id="public_member_list" 
                                        />
                                        <BooleanInput 
                                        errors={form.getErrors} 
                                        hasSubmitted={form.hasSubmitted()}
                                        ref={form.setFormRef(pageId)} 
                                        onValueChanged={form.handleValueChanged(pageId)} 
                                        value={create ? true : configurationData.publish_files} 
                                        title={translate("community.config.title.publish_files")} 
                                        description={translate("community.config.description.publish_files")}
                                        id="publish_files" 
                                        />
                                        
                            </>
                        }} />,
                        <FormPage key="page4" form={this.formController} pageId="4" render={(pageId, form) => {
                            return <>
                                        <SelectInput 
                                            options={communityCreateOptions}
                                            errors={form.getErrors} 
                                            hasSubmitted={form.hasSubmitted()}
                                            ref={form.setFormRef(pageId)} 
                                            onValueChanged={form.handleValueChanged(pageId)} 
                                            value={create ? CommunityCreatePermission.createAllowed.toString() : configurationData.members_group_creation.toString()} 
                                            title={translate("community.config.title.members_group_creation")} 
                                            description={translate("community.config.description.members_group_creation")}
                                            id="members_group_creation" 
                                            isRequired={true}
                                        />
                                        <SelectInput 
                                            options={communityCreateOptions}
                                            errors={form.getErrors} 
                                            hasSubmitted={form.hasSubmitted()}
                                            ref={form.setFormRef(pageId)} 
                                            onValueChanged={form.handleValueChanged(pageId)} 
                                            value={create ? CommunityCreatePermission.createAllowed.toString() : configurationData.subgroups.toString()} 
                                            title={translate("community.config.title.subgroups")} 
                                            description={translate("community.config.description.subgroups")}
                                            id="subgroups" 
                                            isRequired={true}
                                        />
                                        <SelectInput 
                                            options={communityCreateOptions}
                                            errors={form.getErrors} 
                                            hasSubmitted={form.hasSubmitted()}
                                            ref={form.setFormRef(pageId)} 
                                            onValueChanged={form.handleValueChanged(pageId)}
                                            value={create ? CommunityCreatePermission.createAllowed.toString() : configurationData.members_event_creation.toString()} 
                                            title={translate("community.config.title.members_event_creation")} 
                                            description={translate("community.config.description.members_event_creation")}
                                            id="members_event_creation" 
                                            isRequired={true}
                                        />
                                        <SelectInput 
                                            options={communityCreateOptions}
                                            errors={form.getErrors} 
                                            hasSubmitted={form.hasSubmitted()}
                                            ref={form.setFormRef(pageId)} 
                                            onValueChanged={form.handleValueChanged(pageId)} 
                                            value={create ? CommunityCreatePermission.createAllowed.toString() : configurationData.members_project_creation.toString()} 
                                            title={translate("community.config.title.members_project_creation")} 
                                            description={translate("community.config.description.members_project_creation")}
                                            id="members_project_creation" 
                                            isRequired={true}
                                        />
                                        <BooleanInput 
                                        errors={form.getErrors} 
                                        hasSubmitted={form.hasSubmitted()}
                                        ref={form.setFormRef(pageId)} 
                                        onValueChanged={form.handleValueChanged(pageId)} 
                                        value={create ? false : configurationData.allow_anonymous_users} 
                                        title={translate("community.config.title.allow_anonymous_users")} 
                                        description={translate("community.config.description.allow_anonymous_users")}
                                        id="allow_anonymous_users" 
                                        />
                                        
                            </>
                        }} />
                        ]
                        }
                    }}
                    >
                    </FormController>
    }
}
export default withRouter(CommunityCreateComponent)