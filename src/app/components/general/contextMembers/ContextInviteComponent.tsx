import * as React from 'react';
import { translate } from '../../../localization/AutoIntlProvider';
import FormController, { FormStatus } from '../../form/FormController';
import { RequestErrorData, CommunityInvitation, IdentifiableObject, ContextNaturalKey } from '../../../types/intrasocial_types';
import { FormPage } from '../../form/FormPage';
import { removeEmptyEntriesFromObject, nameofFactory} from '../../../utilities/Utilities';
import { ProfileManager } from '../../../managers/ProfileManager';
import { ProfileSelectInput } from '../../form/components/ProfileSelectorInput';
import ListComponent from '../ListComponent';
import { ApiClient } from '../../../network/ApiClient';
import { BooleanInput } from '../../form/components/BooleanInput';
type OwnProps = {
    didCancel:() => void
    visible:boolean
    contextNaturalKey:ContextNaturalKey
    contextObject:IdentifiableObject
    activeMembershipInvitations:number[]
    onCompleted:() => void
    availableMembers:number[]
    members:number[]
}
type InviteFormData = {
    users:number[]
    moderator?:boolean
    manager?:boolean
}
type State = {
    formStatus:FormStatus
    formErrors?:RequestErrorData[]
    formValues:Partial<InviteFormData>
}
type Props = OwnProps

const nameof = nameofFactory<InviteFormData>()
export default class ContextInviteComponent extends React.Component<Props, State> {
    formController:FormController = null
    listRef = React.createRef<ListComponent<CommunityInvitation>>()
    constructor(props:Props) {
        super(props);
        this.state = {
            formStatus:FormStatus.normal,
            formErrors:null,
            formValues:{
                users:[],
                moderator:null,
                manager:null,
            },
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
    handleFormSubmit = () => {
        const {contextNaturalKey, contextObject} = this.props
        this.setFormStatus(FormStatus.submitting)
        const data = this.state.formValues
        const formData = removeEmptyEntriesFromObject(data)
        const hasDataToSave = Object.keys(formData).length > 0
        const onComplete = (response:any, status:string, error:RequestErrorData) => {
            if(error)
            {
                this.setState(() => {
                    return {formErrors:[error]}
                })
                this.setFormStatus(FormStatus.normal)
            }
            else {
                this.setFormStatus(FormStatus.normal)
                this.props.onCompleted()
            }
        }
        if(hasDataToSave)
        {
            if(contextNaturalKey == ContextNaturalKey.PROJECT)
            {
                ApiClient.updateProjectMembership(contextObject.id, formData.users, undefined, formData.moderator, formData.manager, onComplete)
            }
            else {
                ApiClient.createContextInvitation(this.props.contextNaturalKey, this.props.contextObject.id, formData.users, formData.moderator, onComplete)
            }
        }   
        else {
            this.props.didCancel()
        }
    }
    handleValueChanged = (id:string, value:any) => {
        this.setState((prevState:State) => {
            return {formValues:{...prevState.formValues, [id]:value}}
        }, () => {
            console.log(this.state.formValues)
        })
    }
    render = () => {
        const {visible, didCancel, activeMembershipInvitations, contextNaturalKey} = this.props
        const {formValues} = this.state
        const members:number[] = this.props.members || [] 
        const invitationFilterList = [].concat(activeMembershipInvitations).concat(members)
        const availableMembers = ProfileManager.getProfiles(this.props.availableMembers.filter(id => !invitationFilterList.contains(id))) 
        const selectedProfiles = this.state.formValues.users.map(id => availableMembers.find(m => m.id == id)).filter(p => !!p)
        const isProject = contextNaturalKey == ContextNaturalKey.PROJECT
        return <FormController 
                    ref={(controller) => this.formController = controller }
                    visible={visible} 
                    formErrors={this.state.formErrors} 
                    didCancel={didCancel} 
                    status={this.state.formStatus} 
                    onFormSubmit={this.handleFormSubmit} 
                    title={translate(`${this.props.contextNaturalKey}.invite`)} 
                    onValueChanged={this.handleValueChanged}
                    className="context-invite"
                    render={(form) => {
                        return {
                            menuItems:[],
                            pages:[<FormPage key="page1" form={this.formController} pageId="1" render={(pageId, form) => {
                                    return <>
                                        <BooleanInput
                                        errors={form.getErrors} 
                                        hasSubmitted={form.hasSubmitted()}
                                        ref={form.setFormRef(pageId)} 
                                        onValueChanged={form.handleValueChanged(pageId)} 
                                        value={formValues.moderator} 
                                        title={translate("form.invite.title.moderator")} 
                                        description={translate("form.invite.description.moderator")}
                                        id={nameof("moderator")} 
                                        />
                                        {isProject && <BooleanInput
                                        errors={form.getErrors} 
                                        hasSubmitted={form.hasSubmitted()}
                                        ref={form.setFormRef(pageId)} 
                                        onValueChanged={form.handleValueChanged(pageId)} 
                                        value={formValues.manager} 
                                        title={translate("form.invite.title.manager")} 
                                        description={translate("form.invite.description.manager")}
                                        id={nameof("manager")} 
                                        />}
                                        <ProfileSelectInput 
                                        errors={form.getErrors} 
                                        isRequired={false} 
                                        allowedProfiles={availableMembers}
                                        selectedProfiles={selectedProfiles}
                                        hasSubmitted={form.hasSubmitted()}
                                        ref={form.setFormRef(pageId)} 
                                        onValueChanged={form.handleValueChanged(pageId)} 
                                        placeholder={translate("form.invite.users.placeholder")}
                                        description={translate("form.invite.users.description")}
                                        title={translate("form.invite.users.title")} 
                                        id={nameof("users")} 
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