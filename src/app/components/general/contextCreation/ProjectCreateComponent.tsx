import * as React from 'react';
import { translate } from '../../../localization/AutoIntlProvider';
import { ContextNaturalKey, CropRect, ContextPhotoType, RequestErrorData, Project, Group } from '../../../types/intrasocial_types';
import FormController, {FormStatus } from '../../form/FormController';
import {ApiClient} from '../../../network/ApiClient';
import { uniqueId, removeEmptyEntriesFromObject, nullOrUndefined, nameofFactory } from '../../../utilities/Utilities';
import { TextInput } from '../../form/components/TextInput';
import { TextAreaInput } from '../../form/components/TextAreaInput';
import { ContextPhotoInput } from '../../form/components/ContextPhotoInput';
import { RouteComponentProps, withRouter } from 'react-router';
import { FormPage } from '../../form/FormPage';
import { FormMenuItem } from '../../form/FormMenuItem';
import { CommunityManager } from '../../../managers/CommunityManager';
import { SelectInput } from '../../form/components/SelectInput';
import { InputOption } from '../../form/components/RichRadioGroupInput';
import { BooleanInput } from '../../form/components/BooleanInput';

type OwnProps = {
    project?:Project
    visible?:boolean
    onComplete?:(project?:Project) => void
    onCancel?:() => void
    community:number
    groups:Group[]
}
type State = {
    formVisible:boolean
    formReloadKey?:string
    formStatus:FormStatus
    formErrors?:RequestErrorData[]
    formValues:Partial<Project>
}
type Props = OwnProps & RouteComponentProps<any>

const nameof = nameofFactory<Project>()
class ProjectCreateComponent extends React.Component<Props, State> {
    formController:FormController = null
    constructor(props:Props) {
        super(props);
        this.state = {
            formVisible:true,
            formStatus:FormStatus.normal,
            formErrors:null,
            formReloadKey:uniqueId(),
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
    handleUpdateProfileFormSubmit = () => {
        const project:Partial<Project> = this.props.project || {}
        const data = this.state.formValues
        const create = !this.props.project
        if(create)
            data.community =  this.props.community || CommunityManager.getActiveCommunity().id
        //const hasDataToSave = Object.keys(communityData).length > 0
        this.setFormStatus(FormStatus.submitting)
        const {
            name,
            description,
            community,
            group,
            is_private,
            //
            avatar,
            cover,
            //
            ...rest} = data
        const updateData = removeEmptyEntriesFromObject({name, description, community, group, is_private})
        const avatarData:{file:File|string, crop:CropRect} = avatar as any
        const coverData:{file:File|string, crop:CropRect} = cover as any

        let createdProject:Project = null
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
                const updatedProject =  {...(createdProject  || project)} as Project
                if(updatedAvatar)
                    updatedProject.avatar = updatedAvatar
                if(updatedAvatarThumbnail)
                    updatedProject.avatar_thumbnail = updatedAvatarThumbnail
                if(updatedCover)
                    updatedProject.cover_cropped = updatedCover
                if(updatedCoverThumbnail)
                    updatedProject.cover_thumbnail = updatedCoverThumbnail
                this.setFormStatus(FormStatus.normal)
                if(this.props.onComplete)
                {
                    this.props.onComplete(updatedProject)
                }
                else {
                    const shouldRedirect = updatedProject && updatedProject.uri
                    if(shouldRedirect)
                    {
                        this.setState(() => {
                            return {formVisible :false}
                        }, () => {
                            window.app.navigateToRoute(updatedProject.uri)
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
            ApiClient.createProject(updateData, (data, status, errorData) => {
                if(!errorData && data && data.id)
                {
                    createdProject = data
                    if(avatarData)
                        requests.push(() => ApiClient.setContextPhoto(ContextPhotoType.avatar,ContextNaturalKey.PROJECT, createdProject.id, avatarData.file, avatarData.crop, (cropInfo, status, error) => {
                            updatedAvatar = cropInfo && cropInfo.cropped
                            updatedAvatarThumbnail = cropInfo && cropInfo.thumbnail
                            requestCompleter(cropInfo, status, error)
                        }))
                    if(coverData)
                        requests.push(() => ApiClient.setContextPhoto(ContextPhotoType.cover,ContextNaturalKey.PROJECT, createdProject.id, coverData.file, coverData.crop, (cropInfo, status, error) => {
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
                requests.push(() => ApiClient.updateProject(this.props.project.id, updateData, (data, status, error) => {
                    createdProject = data
                    requestCompleter(data, status, error)
                }))
            if(avatarData)
                requests.push(() => ApiClient.setContextPhoto(ContextPhotoType.avatar,ContextNaturalKey.PROJECT, project.id, avatarData.file, avatarData.crop, (cropInfo, status, error) => {
                    updatedAvatar = cropInfo && cropInfo.cropped
                    updatedAvatarThumbnail = cropInfo && cropInfo.thumbnail
                    requestCompleter(cropInfo, status, error)
                }))
            if(coverData)
                requests.push(() => ApiClient.setContextPhoto(ContextPhotoType.cover,ContextNaturalKey.PROJECT, project.id, coverData.file, coverData.crop, (cropInfo, status, error) => {
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
    didCancel = () => {
        if(this.props.onCancel)
            this.props.onCancel()
        else
            this.back()
    }
    render = () => {
        const visible = this.isVisible()
        const project:Partial<Project> = this.props.project || {}
        const create = !this.props.project
        const groupSelectOptions:InputOption[] =  this.props.groups.map(p => {
            return {
                label:p.name,
                value:p.id.toString(),
            }
        })
        return <FormController
                    ref={(controller) => this.formController = controller }
                    key={this.state.formReloadKey}
                    visible={visible}
                    formErrors={this.state.formErrors}
                    didCancel={this.didCancel}
                    status={this.state.formStatus}
                    onFormSubmit={this.handleUpdateProfileFormSubmit}
                    title={translate(create ? "project.create" : "project.update")  }
                    onValueChanged={this.handleValueChanged}
                    render={(form) => {
                        return {
                            menuItems:[
                                <FormMenuItem key="1"
                                    form={form}
                                    pageId="1"
                                    title={translate("project.settings.page.title.primary")}
                                    description={translate("project.settings.page.description.primary")}
                                    />,
                                    <FormMenuItem key="2"
                                    form={form}
                                    pageId="2"
                                    title={translate("project.settings.page.title.appearance")}
                                    description={translate("project.settings.page.description.appearance")}
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
                                        value={project.name}
                                        title={translate("common.name")}
                                        id={nameof("name")}
                                        />
                                        <TextAreaInput
                                        errors={form.getErrors}
                                        hasSubmitted={form.hasSubmitted()}
                                        ref={form.setFormRef(pageId)}
                                        onValueChanged={form.handleValueChanged(pageId)}
                                        value={project.description}
                                        title={translate("common.description")}
                                        id={nameof("description")}
                                        />
                                        <BooleanInput
                                        errors={form.getErrors}
                                        hasSubmitted={form.hasSubmitted()}
                                        ref={form.setFormRef(pageId)}
                                        onValueChanged={form.handleValueChanged(pageId)}
                                        value={project.is_private}
                                        title={translate("project.is_private.title")}
                                        description={translate("project.is_private.description")}
                                        id={nameof("is_private")}
                                        />
                                        {<SelectInput
                                            options={groupSelectOptions}
                                            errors={form.getErrors}
                                            hasSubmitted={form.hasSubmitted()}
                                            ref={form.setFormRef(pageId)}
                                            onValueChanged={form.handleValueChanged(pageId)}
                                            value={project.group && project.group.id.toString()}
                                            title={translate("common.group")}
                                            id={nameof("group")}
                                            isRequired={false}
                                            isDisabled={!create}
                                        />}
                                        </>
                            }} />,
                            <FormPage key="page2" form={this.formController} pageId="2" render={(pageId, form) => {
                                return <>
                                        <ContextPhotoInput
                                            errors={form.getErrors}
                                            hasSubmitted={form.hasSubmitted()}
                                            ref={form.setFormRef(pageId)}
                                            onValueChanged={form.handleValueChanged(pageId)}
                                            value={project.avatar}
                                            title={translate("common.avatar")}
                                            onRequestNavigation={form.handleRequestNavigation}
                                            contextNaturalKey={ContextNaturalKey.PROJECT}
                                            contextObjectId={project.id}
                                            id={nameof("avatar")}
                                        />
                                        <ContextPhotoInput
                                            errors={form.getErrors}
                                            hasSubmitted={form.hasSubmitted()}
                                            ref={form.setFormRef(pageId)}
                                            onValueChanged={form.handleValueChanged(pageId)}
                                            value={project.cover_cropped}
                                            title={translate("common.cover")}
                                            onRequestNavigation={form.handleRequestNavigation}
                                            contextNaturalKey={ContextNaturalKey.PROJECT}
                                            contextObjectId={project.id}
                                            id={nameof("cover")}
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
export default withRouter(ProjectCreateComponent)