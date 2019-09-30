import * as React from 'react';
import { translate } from '../../../localization/AutoIntlProvider';
import FormController, { FormStatus } from '../../form/FormController';
import { RequestErrorData, AppLanguage, Community, CommunityInvitation } from '../../../types/intrasocial_types';
import { FormPage } from '../../form/FormPage';
import { TextAreaInput } from '../../form/components/TextAreaInput';
import { removeEmptyEntriesFromObject, nameofFactory} from '../../../utilities/Utilities';
import { ProfileManager } from '../../../managers/ProfileManager';
import { ProfileSelectInput } from '../../form/components/ProfileSelectorInput';
import { SelectInput } from '../../form/components/SelectInput';
import { InputOption } from '../../form/components/RichRadioGroupInput';
import { ApplicationManager } from '../../../managers/ApplicationManager';
import { SelectCreateInput } from '../../form/components/SelectCreateInput';
import ListComponent from '../ListComponent';
import "./CommunityInviteComponent.scss"
import { ApiClient } from '../../../network/ApiClient';
type OwnProps = {
    didCancel:() => void
    visible:boolean
    community:Community
    activeMembershipInvitations:number[]
    onInvited:() => void
}
type InviteFormData = {
    message:string
    language:AppLanguage
    emails:string[]
    users:number[]
}
type State = {
    formVisible:boolean
    formStatus:FormStatus
    formErrors?:RequestErrorData[]
    formValues:Partial<InviteFormData>
}
type Props = OwnProps

const nameof = nameofFactory<InviteFormData>()
export default class CommunityInviteComponent extends React.Component<Props, State> {
    formController:FormController = null
    listRef = React.createRef<ListComponent<CommunityInvitation>>()
    constructor(props:Props) {
        super(props);
        this.state = {
            formVisible:true,
            formStatus:FormStatus.normal,
            formErrors:null,
            formValues:{
                users:[],
                language:ApplicationManager.getLanguage(),
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

        this.setFormStatus(FormStatus.submitting)
        const data = this.state.formValues
        const formData = removeEmptyEntriesFromObject(data)
        const hasDataToSave = Object.keys(formData).length > 0
        if(hasDataToSave)
        {
            const community = this.props.community.id
            ApiClient.createCommunityInvitation(community, formData.message, formData.language, formData.emails, formData.users, (response, status, error) => {
                if(error)
                {
                    this.setState(() => {
                        return {formErrors:[error]}
                    })
                    this.setFormStatus(FormStatus.normal)
                }
                else {
                    this.setFormStatus(FormStatus.normal)
                    this.props.onInvited()
                }
            })
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
        const {visible, didCancel, community, activeMembershipInvitations} = this.props
        const formData = this.state.formValues
        const invitationFilterList = [].concat(activeMembershipInvitations).concat(community.members)
        const availableMembers = ProfileManager.getProfiles(ProfileManager.getContactListIds(false).filter(id => !invitationFilterList.contains(id))) 
        const selectedProfiles = this.state.formValues.users.map(id => availableMembers.find(m => m.id == id)).filter(p => !!p)
        const languages:InputOption[] = AppLanguage.all.map(p => {
            return {
                label:AppLanguage.translationForKey(p), 
                value:p, 
            }
        })
        
        return <FormController 
                    ref={(controller) => this.formController = controller }
                    visible={visible} 
                    formErrors={this.state.formErrors} 
                    didCancel={didCancel} 
                    status={this.state.formStatus} 
                    onFormSubmit={this.handleFormSubmit} 
                    title={translate("community.invite")} 
                    onValueChanged={this.handleValueChanged}
                    className="community-invite"
                    render={(form) => {
                        return {
                            menuItems:[],
                            pages:[<FormPage key="page1" form={this.formController} pageId="1" render={(pageId, form) => {
                                    return <>
                                        <SelectCreateInput 
                                        errors={form.getErrors} 
                                        isRequired={false} 
                                        hasSubmitted={form.hasSubmitted()}
                                        ref={form.setFormRef(pageId)} 
                                        canCreateValue={String.isEmail}
                                        onValueChanged={form.handleValueChanged(pageId)} 
                                        placeholder={translate("form.invite.email.placeholder")}
                                        title={translate("form.invite.email.title")} 
                                        description={translate("form.invite.email.description")}
                                        id={nameof("emails")} 
                                        />
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
                                        <SelectInput 
                                            options={languages}
                                            errors={form.getErrors} 
                                            hasSubmitted={form.hasSubmitted()}
                                            ref={form.setFormRef(pageId)} 
                                            onValueChanged={form.handleValueChanged(pageId)} 
                                            value={formData.language} 
                                            title={translate("form.invite.language.title")} 
                                            id={nameof("language")} 
                                            isRequired={false}
                                        />
                                        <TextAreaInput 
                                        errors={form.getErrors} 
                                        hasSubmitted={form.hasSubmitted()}
                                        ref={form.setFormRef(pageId)} 
                                        onValueChanged={form.handleValueChanged(pageId)} 
                                        value={null} 
                                        title={translate("form.invite.message.title")} 
                                        id={nameof("message")}  
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