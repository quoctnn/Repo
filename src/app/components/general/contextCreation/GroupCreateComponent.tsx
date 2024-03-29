import * as React from 'react';
import { translate } from '../../../localization/AutoIntlProvider';
import { Group, ContextNaturalKey, CropRect, ContextPhotoType, RequestErrorData, ContextPrivacy} from '../../../types/intrasocial_types';
import FormController, {  FormStatus } from '../../form/FormController';
import {ApiClient} from '../../../network/ApiClient';
import { removeEmptyEntriesFromObject, nullOrUndefined } from '../../../utilities/Utilities';
import { TextInput } from '../../form/components/TextInput';
import { InputOption, RichRadioGroupInput } from '../../form/components/RichRadioGroupInput';
import { RouteComponentProps, withRouter } from 'react-router';
import { FormMenuItem } from '../../form/FormMenuItem';
import { FormPage } from '../../form/FormPage';
import { TextAreaInput } from '../../form/components/TextAreaInput';
import { ContextPhotoInput } from '../../form/components/ContextPhotoInput';
import { CommunityManager } from '../../../managers/CommunityManager';
type OwnProps = {
    group?:Group
    visible?:boolean
    onComplete?:(group?:Group) => void
    onCancel?:() => void
    community:number
}
type State = {
    formVisible:boolean
    formStatus:FormStatus
    formErrors?:RequestErrorData[]
    formValues:Partial<Group>
}
type Props = OwnProps & RouteComponentProps<any>
class GroupCreateComponent extends React.Component<Props, State> {
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
    didCancel = () => {
        if(this.props.onCancel)
            this.props.onCancel()
        else
            this.back()
    }
    handleCreateGroupFormSubmit = () => {
        const data = this.state.formValues
        const group:Partial<Group> = this.props.group || {}
        const create = !this.props.group
        if(create)
            data.community =  this.props.community || CommunityManager.getActiveCommunity().id
        //const hasDataToSave = Object.keys(communityData).length > 0
        this.setFormStatus(FormStatus.submitting)
        const {
            name,
            description,
            privacy,
            community,
            //
            avatar,
            cover,
            //
            ...rest} = data
        const updateData = removeEmptyEntriesFromObject({name, description, privacy, community})
        const avatarData:{file:File|string, crop:CropRect} = avatar as any
        const coverData:{file:File|string, crop:CropRect} = cover as any
        let createdGroup:Group = null
        let updatedAvatar:string = null
        let updatedAvatarThumbnail:string = null
        let updatedCover:string = null
        let updatedCoverThumbnail:string = null
        const completed = () => {
            if(errors.length > 0)
            {
                this.setState(() => {
                    return {formErrors:errors}
                })
                this.setFormStatus(FormStatus.normal)
            }
            else {
                const updatedGroup =  {...(createdGroup  || group)} as Group
                if(updatedAvatar)
                    updatedGroup.avatar = updatedAvatar
                if(updatedAvatarThumbnail)
                    updatedGroup.avatar_thumbnail = updatedAvatarThumbnail
                if(updatedCover)
                    updatedGroup.cover_cropped = updatedCover
                if(updatedCoverThumbnail)
                    updatedGroup.cover_thumbnail = updatedCoverThumbnail
                this.setFormStatus(FormStatus.normal)
                if(this.props.onComplete)
                {
                    this.props.onComplete(updatedGroup)
                }
                else {
                    const shouldRedirect = updatedGroup && updatedGroup.uri
                    if(shouldRedirect)
                    {
                        this.setState(() => {
                            return {formVisible :false}
                        }, () => {
                            window.app.navigateToRoute(updatedGroup.uri)
                        })
                    }
                    else
                        this.didCancel()
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
        if(create)
        {
            ApiClient.createGroup(updateData, (data, status, errorData) => {
                if(!errorData && data && data.id)
                {
                    createdGroup = data

                    if(avatarData)
                        requests.push(() => ApiClient.setContextPhoto(ContextPhotoType.avatar,ContextNaturalKey.GROUP, createdGroup.id, avatarData.file, avatarData.crop, (cropInfo, status, error) => {
                            updatedAvatar = cropInfo && cropInfo.cropped
                            updatedAvatarThumbnail = cropInfo && cropInfo.thumbnail
                            requestCompleter(cropInfo, status, error)
                        }))
                    if(coverData)
                        requests.push(() => ApiClient.setContextPhoto(ContextPhotoType.cover,ContextNaturalKey.GROUP, createdGroup.id, coverData.file, coverData.crop, (cropInfo, status, error) => {
                            updatedCover = cropInfo && cropInfo.cropped
                            updatedCoverThumbnail = cropInfo && cropInfo.thumbnail
                            requestCompleter(cropInfo, status, error)
                        }))
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
                requests.push(() => ApiClient.updateGroup(this.props.group.id, updateData,(data, status, error) => {
                    createdGroup = data
                    requestCompleter(data, status, error)
                }))
            if(avatarData)
                requests.push(() => ApiClient.setContextPhoto(ContextPhotoType.avatar,ContextNaturalKey.GROUP, group.id, avatarData.file, avatarData.crop, (cropInfo, status, error) => {
                    updatedAvatar = cropInfo && cropInfo.cropped
                    updatedAvatarThumbnail = cropInfo && cropInfo.thumbnail
                    requestCompleter(cropInfo, status, error)
                }))
            if(coverData)
                requests.push(() => ApiClient.setContextPhoto(ContextPhotoType.cover,ContextNaturalKey.GROUP, group.id, coverData.file, coverData.crop, (cropInfo, status, error) => {
                    updatedCover = cropInfo && cropInfo.cropped
                    updatedCoverThumbnail = cropInfo && cropInfo.thumbnail
                    requestCompleter(cropInfo, status, error)
                }))
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
        }, () => {})
    }
    render = () => {
        const visible = this.isVisible()
        const group:Partial<Group> = this.props.group || {}
        const create = !this.props.group

        const privacyOptions:InputOption[] = ContextPrivacy.all.map(p => {
            return {
                label:ContextPrivacy.titleForKey(p),
                value:p,
                description:ContextPrivacy.descriptionForKey(p),
                icon:ContextPrivacy.iconClassForKey(p),
            }
        })
        return <FormController
                    ref={(controller) => this.formController = controller }
                    visible={visible}
                    formErrors={this.state.formErrors}
                    didCancel={this.didCancel}
                    status={this.state.formStatus}
                    onFormSubmit={this.handleCreateGroupFormSubmit}
                    title={translate(create ? "group.create" : "group.update")  }
                    onValueChanged={this.handleValueChanged}
                    render={(form) => {
                        return {
                            menuItems:[
                                <FormMenuItem key="1"
                                    form={form}
                                    pageId="1"
                                    title={translate("group.settings.page.title.primary")}
                                    description={translate("group.settings.page.description.primary")}
                                    />,
                                    <FormMenuItem key="2"
                                    form={form}
                                    pageId="2"
                                    title={translate("group.settings.page.title.appearance")}
                                    description={translate("group.settings.page.description.appearance")}
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
                                        value={group.name}
                                        title={translate("common.name")}
                                        id="name"
                                        />
                                        <TextAreaInput
                                        errors={form.getErrors}
                                        hasSubmitted={form.hasSubmitted()}
                                        ref={form.setFormRef(pageId)}
                                        onValueChanged={form.handleValueChanged(pageId)}
                                        value={group.description}
                                        title={translate("common.description")}
                                        id="description"
                                        />
                                        <RichRadioGroupInput
                                            options={privacyOptions}
                                            errors={form.getErrors}
                                            hasSubmitted={form.hasSubmitted()}
                                            ref={form.setFormRef(pageId)}
                                            onValueChanged={form.handleValueChanged(pageId)}
                                            value={group.privacy}
                                            title={translate("common.privacy")}
                                            id="privacy"
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
                                            value={group.avatar}
                                            title={translate("common.avatar")}
                                            onRequestNavigation={form.handleRequestNavigation}
                                            contextNaturalKey={ContextNaturalKey.GROUP}
                                            contextObjectId={group.id}
                                            id="avatar"
                                        />
                                        <ContextPhotoInput
                                            errors={form.getErrors}
                                            hasSubmitted={form.hasSubmitted()}
                                            ref={form.setFormRef(pageId)}
                                            onValueChanged={form.handleValueChanged(pageId)}
                                            value={group.cover_cropped}
                                            title={translate("common.cover")}
                                            onRequestNavigation={form.handleRequestNavigation}
                                            contextNaturalKey={ContextNaturalKey.GROUP}
                                            contextObjectId={group.id}
                                            id="cover"
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
export default withRouter(GroupCreateComponent)