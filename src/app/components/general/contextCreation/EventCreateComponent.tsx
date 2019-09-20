import * as React from 'react';
import { translate } from '../../../localization/AutoIntlProvider';
import { ContextNaturalKey, CropRect, ContextPhotoType, CropInfo, RequestErrorData, ContextPrivacy, CommunityCategory, CommunityCreatePermission, Event } from '../../../types/intrasocial_types';
import FormController, {FormStatus } from '../../form/FormController';
import {ApiClient, ApiClientCallback} from '../../../network/ApiClient';
import { uniqueId, removeEmptyEntriesFromObject, nullOrUndefined } from '../../../utilities/Utilities';
import { TextInput } from '../../form/components/TextInput';
import { TextAreaInput } from '../../form/components/TextAreaInput';
import { ContextPhotoInput } from '../../form/components/ContextPhotoInput';
import { InputOption, RichRadioGroupInput } from '../../form/components/RichRadioGroupInput';
import { RouteComponentProps, withRouter } from 'react-router';
import { DateRangeInput } from '../../form/components/DateRangeInput';
import { FormPage } from '../../form/FormPage';
import { FormMenuItem } from '../../form/FormMenuItem';
import { CommunityManager } from '../../../managers/CommunityManager';
import { EventManager } from '../../../managers/EventManager';
import { LocationInput } from '../../form/components/LocationInput';
import { AddressInput } from '../../form/components/AddressInput';
type OwnProps = {
    event?:Event
    visible?:boolean
    onComplete?:() => void
}
type State = {
    formVisible:boolean
    formReloadKey?:string
    formStatus:FormStatus
    formErrors?:RequestErrorData[]
    formValues:Partial<Event>
}
type Props = OwnProps & RouteComponentProps<any>
class EventCreateComponent extends React.Component<Props, State> {
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
    uploadContextPhoto = (type:ContextPhotoType, contextNaturalKey:ContextNaturalKey, contextObjectId:number, file:File|string, crop:CropRect, completion:ApiClientCallback<CropInfo>) => () => {
        ApiClient.setContextPhoto(type,contextNaturalKey, contextObjectId, file, crop, completion)
    }
    handleCreateEventFormSubmit = () => {
        const event:Partial<Event> = this.props.event || {}
        const create = !this.props.event
        const data = this.state.formValues
        if(create)
            data.community =  CommunityManager.getActiveCommunity().id
        console.log("formdata", data)
        //const hasDataToSave = Object.keys(communityData).length > 0
        this.setFormStatus(FormStatus.submitting)
        const {
            name, 
            description, 
            privacy,
            start,
            end,
            community,
            location,
            address,
            //
            avatar, 
            cover,
            //
            ...rest} = data
        const updateData = removeEmptyEntriesFromObject({name, description, privacy, start, end, community, location, address})
        const avatarData:{file:File|string, crop:CropRect} = avatar as any
        const coverData:{file:File|string, crop:CropRect} = cover as any
        let createdEvent:Event = null
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
                const shouldRedirect = !!createdEvent && createdEvent.uri && ((create && !this.hasOutsideVisibilityToggle()) || (!create && createdEvent.uri != event.uri))
                if(shouldRedirect)
                {
                    this.setState(() => {
                        return {formVisible :false}
                    }, () => {
                        window.app.navigateToRoute(createdEvent.uri)
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
            ApiClient.createEvent(updateData, (data, status, errorData) => {
                if(!errorData && data && data.id)
                {
                    createdEvent = data
                    if(!!createdEvent)
                        EventManager.storeEvents([createdEvent])
                    if(avatarData)
                        requests.push(this.uploadContextPhoto(ContextPhotoType.avatar,ContextNaturalKey.EVENT, createdEvent.id, avatarData.file, avatarData.crop, requestCompleter))
                    if(coverData)
                        requests.push(this.uploadContextPhoto(ContextPhotoType.cover,ContextNaturalKey.EVENT, createdEvent.id, coverData.file, coverData.crop, requestCompleter))
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
                requests.push(() => ApiClient.updateEvent(event.id, updateData, (data, status, error) => {
                    createdEvent = data
                    if(!!createdEvent)
                        EventManager.storeEvents([createdEvent])
                    requestCompleter(data, status, error)
                }))
            if(avatarData)
                requests.push(this.uploadContextPhoto(ContextPhotoType.avatar,ContextNaturalKey.EVENT, event.id, avatarData.file, avatarData.crop, requestCompleter))
            if(coverData)
                requests.push(this.uploadContextPhoto(ContextPhotoType.cover,ContextNaturalKey.EVENT, event.id, coverData.file, coverData.crop, requestCompleter))
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
        const event:Partial<Event> = this.props.event || {}
        const create = !this.props.event
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
                    key={this.state.formReloadKey} 
                    visible={visible} 
                    formErrors={this.state.formErrors} 
                    didCancel={this.didCancel} 
                    status={this.state.formStatus} 
                    onFormSubmit={this.handleCreateEventFormSubmit} 
                    title={translate(create ? "event.create" : "event.update")  } 
                    onValueChanged={this.handleValueChanged}
                    render={(form) => {
                        return {
                            menuItems:[
                                <FormMenuItem key="1"
                                    form={form} 
                                    pageId="1" 
                                    title={translate("event.settings.page.title.primary")} 
                                    description={translate("event.settings.page.description.primary")}  
                                    />,
                                    <FormMenuItem key="2"
                                    form={form} 
                                    pageId="2" 
                                    title={translate("event.settings.page.title.appearance")} 
                                    description={translate("event.settings.page.description.appearance")}  
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
                                        value={event.name} 
                                        title={translate("common.name")} 
                                        id="name" 
                                        />
                                        <TextAreaInput 
                                        errors={form.getErrors} 
                                        hasSubmitted={form.hasSubmitted()}
                                        ref={form.setFormRef(pageId)} 
                                        onValueChanged={form.handleValueChanged(pageId)} 
                                        value={event.description} 
                                        title={translate("common.description")} 
                                        id="description" 
                                        />
                                        <AddressInput 
                                        errors={form.getErrors} 
                                        hasSubmitted={form.hasSubmitted()}
                                        ref={form.setFormRef(pageId)} 
                                        onValueChanged={form.handleValueChanged(pageId)} 
                                        address={event.address} 
                                        location={this.state.formValues.location || event.location}
                                        title={translate("common.address")} 
                                        id="address" 
                                        />
                                        <LocationInput 
                                        errors={form.getErrors} 
                                        hasSubmitted={form.hasSubmitted()}
                                        ref={form.setFormRef(pageId)} 
                                        onValueChanged={form.handleValueChanged(pageId)} 
                                        location={event.location} 
                                        title={translate("common.location")} 
                                        id="location" 
                                        />
                                         <DateRangeInput
                                        errors={form.getErrors} 
                                        hasSubmitted={form.hasSubmitted()}
                                        ref={form.setFormRef(pageId)} 
                                        onValueChanged={form.handleValueChanged(pageId)}
                                        start={event.start}
                                        end={event.end}
                                        startId="start"
                                        endId="end"
                                        startTitle={translate("event.date.start")}
                                        endTitle={translate("event.date.end")}
                                        title={translate("common.description")} 
                                        id="date"
                                        isRequired={true}
                                        />
                                        <RichRadioGroupInput
                                            options={privacyOptions}
                                            errors={form.getErrors} 
                                            hasSubmitted={form.hasSubmitted()}
                                            ref={form.setFormRef(pageId)} 
                                            onValueChanged={form.handleValueChanged(pageId)} 
                                            value={event.privacy} 
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
                                            value={event.avatar} 
                                            title={translate("common.avatar")} 
                                            onRequestNavigation={form.handleRequestNavigation}
                                            contextNaturalKey={ContextNaturalKey.EVENT}
                                            contextObjectId={event.id}
                                            id="avatar" 
                                        />
                                        <ContextPhotoInput 
                                            errors={form.getErrors} 
                                            hasSubmitted={form.hasSubmitted()}
                                            ref={form.setFormRef(pageId)} 
                                            onValueChanged={form.handleValueChanged(pageId)} 
                                            value={event.cover} 
                                            title={translate("common.cover")} 
                                            onRequestNavigation={form.handleRequestNavigation}
                                            contextNaturalKey={ContextNaturalKey.EVENT}
                                            contextObjectId={event.id}
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
export default withRouter(EventCreateComponent)