import * as React from 'react';
import { translate } from '../../../localization/AutoIntlProvider';
import { ContextNaturalKey, CropRect, ContextPhotoType, RequestErrorData, UserProfile, AppLanguage } from '../../../types/intrasocial_types';
import FormController, {FormStatus } from '../../form/FormController';
import {ApiClient} from '../../../network/ApiClient';
import { uniqueId, removeEmptyEntriesFromObject, nullOrUndefined } from '../../../utilities/Utilities';
import { TextInput } from '../../form/components/TextInput';
import { TextAreaInput } from '../../form/components/TextAreaInput';
import { ContextPhotoInput } from '../../form/components/ContextPhotoInput';
import { RouteComponentProps, withRouter } from 'react-router';
import { FormPage } from '../../form/FormPage';
import { FormMenuItem } from '../../form/FormMenuItem';
import { SelectInput } from '../../form/components/SelectInput';
import { InputOption } from '../../form/components/RichRadioGroupInput';
import { TimezoneInput } from '../../form/components/TimezoneInput';

type OwnProps = {
    profile:UserProfile
    visible?:boolean
    onComplete?:(profile?:UserProfile) => void
    onCancel?:() => void
}
type State = {
    formVisible:boolean
    formReloadKey?:string
    formStatus:FormStatus
    formErrors?:RequestErrorData[]
    formValues:Partial<UserProfile>
}
type Props = OwnProps & RouteComponentProps<any>
class ProfileUpdateComponent extends React.Component<Props, State> {
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
        const profile:Partial<UserProfile> = this.props.profile || {}
        const data = this.state.formValues
        //const hasDataToSave = Object.keys(communityData).length > 0
        this.setFormStatus(FormStatus.submitting)
        const {
            first_name,
            last_name,
            biography,
            locale,
            timezone,
            //
            avatar,
            cover,
            //
            ...rest} = data
        const updateData = removeEmptyEntriesFromObject({first_name, last_name, biography, locale, timezone})
        const avatarData:{file:File|string, crop:CropRect} = avatar as any
        const coverData:{file:File|string, crop:CropRect} = cover as any

        let updatedUserProfile:UserProfile = null
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
                const updatedProfile =  {...(updatedUserProfile  || profile)} as UserProfile
                if(updatedAvatar)
                    updatedProfile.avatar = updatedAvatar
                if(updatedAvatarThumbnail)
                    updatedProfile.avatar_thumbnail = updatedAvatarThumbnail
                if(updatedCover)
                    updatedProfile.cover_cropped = updatedCover
                if(updatedCoverThumbnail)
                    updatedProfile.cover_thumbnail = updatedCoverThumbnail
                this.setFormStatus(FormStatus.normal)
                if(this.props.onComplete)
                {
                    this.props.onComplete(updatedProfile)
                }
                else {
                    const shouldRedirect = updatedProfile && updatedProfile.uri
                    if(shouldRedirect)
                    {
                        this.setState(() => {
                            return {formVisible :false}
                        }, () => {
                            debugger
                            window.app.navigateToRoute(updatedProfile.uri)
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
        if(Object.keys(updateData).length > 0)
            requests.push(() => ApiClient.updateProfile(updateData, (data, status, error) => {
                updatedUserProfile = data
                requestCompleter(data, status, error)
            }))
        if(avatarData)
            requests.push(() => ApiClient.setContextPhoto(ContextPhotoType.avatar,ContextNaturalKey.USER, profile.id, avatarData.file, avatarData.crop, (cropInfo, status, error) => {
                updatedAvatar = cropInfo && cropInfo.cropped
                updatedAvatarThumbnail = cropInfo && cropInfo.thumbnail
                requestCompleter(cropInfo, status, error)
        }))
        if(coverData)
            requests.push(() => ApiClient.setContextPhoto(ContextPhotoType.cover,ContextNaturalKey.USER, profile.id, coverData.file, coverData.crop, (cropInfo, status, error) => {
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
        const profile:Partial<UserProfile> = this.props.profile || {}
        const languages:InputOption[] = AppLanguage.all.map(p => {
            return {
                label:AppLanguage.translationForKey(p),
                value:p,
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
                    title={translate("profile.update")  }
                    onValueChanged={this.handleValueChanged}
                    render={(form) => {
                        return {
                            menuItems:[
                                <FormMenuItem key="1"
                                    form={form}
                                    pageId="1"
                                    title={translate("profile.settings.page.title.primary")}
                                    description={translate("profile.settings.page.description.primary")}
                                    />,
                                    <FormMenuItem key="2"
                                    form={form}
                                    pageId="2"
                                    title={translate("profile.settings.page.title.appearance")}
                                    description={translate("profile.settings.page.description.appearance")}
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
                                        value={profile.first_name}
                                        title={translate("common.first_name")}
                                        id="first_name"
                                        />
                                        <TextInput
                                        errors={form.getErrors}
                                        isRequired={true}
                                        hasSubmitted={form.hasSubmitted()}
                                        ref={form.setFormRef(pageId)}
                                        onValueChanged={form.handleValueChanged(pageId)}
                                        value={profile.last_name}
                                        title={translate("common.last_name")}
                                        id="last_name"
                                        />
                                        <SelectInput
                                            options={languages}
                                            errors={form.getErrors}
                                            hasSubmitted={form.hasSubmitted()}
                                            ref={form.setFormRef(pageId)}
                                            onValueChanged={form.handleValueChanged(pageId)}
                                            value={profile.locale}
                                            title={translate("common.language")}
                                            id="locale"
                                            isRequired={true}
                                        />
                                        <TimezoneInput
                                            errors={form.getErrors}
                                            hasSubmitted={form.hasSubmitted()}
                                            ref={form.setFormRef(pageId)}
                                            onValueChanged={form.handleValueChanged(pageId)}
                                            value={profile.timezone}
                                            title={translate("common.timezone")}
                                            id="timezone"
                                            isRequired={true}
                                        />
                                        <TextAreaInput
                                        errors={form.getErrors}
                                        hasSubmitted={form.hasSubmitted()}
                                        ref={form.setFormRef(pageId)}
                                        onValueChanged={form.handleValueChanged(pageId)}
                                        value={profile.biography}
                                        title={translate("common.biography")}
                                        id="biography"
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
                                            value={profile.avatar}
                                            title={translate("common.avatar")}
                                            onRequestNavigation={form.handleRequestNavigation}
                                            contextNaturalKey={ContextNaturalKey.USER}
                                            contextObjectId={profile.id}
                                            id="avatar"
                                        />
                                        <ContextPhotoInput
                                            errors={form.getErrors}
                                            hasSubmitted={form.hasSubmitted()}
                                            ref={form.setFormRef(pageId)}
                                            onValueChanged={form.handleValueChanged(pageId)}
                                            value={profile.cover_cropped}
                                            title={translate("common.cover")}
                                            onRequestNavigation={form.handleRequestNavigation}
                                            contextNaturalKey={ContextNaturalKey.USER}
                                            contextObjectId={profile.id}
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
export default withRouter(ProfileUpdateComponent)