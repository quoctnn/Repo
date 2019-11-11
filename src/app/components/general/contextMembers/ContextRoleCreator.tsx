import * as React from 'react';
import { ContextNaturalKey, RequestErrorData, CommunityRole, Community, CommunityRoleCreatePermission } from '../../../types/intrasocial_types';
import FormController, { FormStatus } from '../../form/FormController';
import { translate } from '../../../localization/AutoIntlProvider';
import { FormPage } from '../../form/FormPage';
import { ProfileSelectInput } from '../../form/components/ProfileSelectorInput';
import { ProfileManager } from '../../../managers/ProfileManager';
import { nameofFactory, removeEmptyEntriesFromObject } from '../../../utilities/Utilities';
import { TextInput } from '../../form/components/TextInput';
import { ApiClient } from '../../../network/ApiClient';
import { SelectInput } from '../../form/components/SelectInput';
import { InputOption } from '../../form/components/RichRadioGroupInput';
import { ColorInput } from '../../form/components/ColorInput';
import { BooleanInput } from '../../form/components/BooleanInput';
import { PredefinedColorInput } from '../../form/components/PredefinedColorInput';

type OwnProps = {
    didCancel:() => void
    visible:boolean
    contextNaturalKey:ContextNaturalKey
    community:Community
    role?:CommunityRole
    onComplete:(role:CommunityRole) => void
}
type State = {
    formStatus:FormStatus
    formErrors?:RequestErrorData[]
    formValues:Partial<CommunityRole>
}
type Props = OwnProps
const nameof = nameofFactory<CommunityRole>()
export default class ContextRoleCreator extends React.Component<Props, State> {
    formController:FormController = null
    constructor(props:Props) {
        super(props);
        this.state = {
            formStatus:FormStatus.normal,
            formErrors:null,
            formValues:{
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

        const {role, community} = this.props
        const {formValues} = this.state
        const create = !role

        const formData = removeEmptyEntriesFromObject(formValues)
        const hasDataToSave = Object.keys(formData).length > 0
        if(!hasDataToSave)
        {
            this.props.didCancel()
            return 
        }
        this.setFormStatus(FormStatus.submitting)
        const complete = (role:CommunityRole, status:string, error: RequestErrorData) => {
            if(error)
            {
                this.setState(() => {
                    return {formErrors:[error]}
                })
                this.setFormStatus(FormStatus.normal)
            }
            else {
                this.setFormStatus(FormStatus.normal)
                this.props.onComplete(role)
            }
        }
        if(create)
        {
            formData.community = community.id,
            ApiClient.createCommunityRole(formData as CommunityRole, complete)
        }
        else {
            formData.id = role && role.id
            ApiClient.updateCommunityRole(formData as CommunityRole, complete)
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
        const {visible, didCancel, role, community} = this.props
        const create = !role
        const members = community.members || []
        const selected = role && role.users || []
        const availableMembers = ProfileManager.getProfiles(members) 
        const selectedMembers = ProfileManager.getProfiles(selected) 

        const communityCreateRoleOptions:InputOption[] = CommunityRoleCreatePermission.all.map(p => {
            return {
                label:CommunityRoleCreatePermission.translationForKey(p), 
                value:p.toString(), 
            }
        })
        return <FormController 
                    ref={(controller) => this.formController = controller }
                    visible={visible} 
                    formErrors={this.state.formErrors} 
                    didCancel={didCancel} 
                    status={this.state.formStatus} 
                    onFormSubmit={this.handleFormSubmit} 
                    title={translate(create ? "role.create" : "role.update")} 
                    onValueChanged={this.handleValueChanged}
                    className="context-invite"
                    render={(form) => {
                        return {
                            menuItems:[],
                            pages:[<FormPage key="page1" form={this.formController} pageId="1" render={(pageId, form) => {
                                    return <>
                                    <TextInput 
                                        errors={form.getErrors} 
                                        isRequired={true} 
                                        hasSubmitted={form.hasSubmitted()}
                                        ref={form.setFormRef(pageId)} 
                                        onValueChanged={form.handleValueChanged(pageId)} 
                                        value={role && role.role} 
                                        title={translate("common.name")} 
                                        id={nameof("role")} 
                                        />
                                    <ProfileSelectInput 
                                        errors={form.getErrors} 
                                        isRequired={false} 
                                        allowedProfiles={availableMembers}
                                        selectedProfiles={selectedMembers}
                                        hasSubmitted={form.hasSubmitted()}
                                        ref={form.setFormRef(pageId)} 
                                        onValueChanged={form.handleValueChanged(pageId)} 
                                        placeholder={translate("form.role.users.placeholder")}
                                        description={translate("form.role.users.description")}
                                        title={translate("form.role.users.title")} 
                                        id={nameof("users")} 
                                    />
                                    <PredefinedColorInput 
                                        errors={form.getErrors} 
                                        hasSubmitted={form.hasSubmitted()}
                                        ref={form.setFormRef(pageId)} 
                                        onValueChanged={form.handleValueChanged(pageId)} 
                                        value={role && role.color} 
                                        title={translate("form.role.title.color")} 
                                        id={nameof("color")}  
                                        isRequired={true}
                                        />
                                    <BooleanInput 
                                        errors={form.getErrors} 
                                        hasSubmitted={form.hasSubmitted()}
                                        ref={form.setFormRef(pageId)} 
                                        onValueChanged={form.handleValueChanged(pageId)} 
                                        value={role && role.moderator} 
                                        title={translate("form.role.moderator.title")} 
                                        description={translate("form.role.moderator.description")}
                                        id={nameof("moderator")}   
                                        />

                                    <BooleanInput 
                                        errors={form.getErrors} 
                                        hasSubmitted={form.hasSubmitted()}
                                        ref={form.setFormRef(pageId)} 
                                        onValueChanged={form.handleValueChanged(pageId)} 
                                        value={role && role.manager} 
                                        title={translate("form.role.manager.title")} 
                                        description={translate("form.role.manager.description")}
                                        id={nameof("manager")}   
                                        />
                                    <SelectInput 
                                        options={communityCreateRoleOptions}
                                        errors={form.getErrors} 
                                        hasSubmitted={form.hasSubmitted()}
                                        ref={form.setFormRef(pageId)} 
                                        onValueChanged={form.handleValueChanged(pageId)} 
                                        value={role && role.group_creation.toString() || CommunityRoleCreatePermission.inherit.toString()} 
                                        title={translate("form.role.group_creation")} 
                                        id={nameof("group_creation")}
                                        isRequired={false}
                                    />
                                    <SelectInput 
                                        options={communityCreateRoleOptions}
                                        errors={form.getErrors} 
                                        hasSubmitted={form.hasSubmitted()}
                                        ref={form.setFormRef(pageId)} 
                                        onValueChanged={form.handleValueChanged(pageId)} 
                                        value={role && role.subgroup_creation.toString() || CommunityRoleCreatePermission.inherit.toString()} 
                                        title={translate("form.role.subgroup_creation")} 
                                        id={nameof("subgroup_creation")}
                                        isRequired={false}
                                    />

                                    <SelectInput 
                                        options={communityCreateRoleOptions}
                                        errors={form.getErrors} 
                                        hasSubmitted={form.hasSubmitted()}
                                        ref={form.setFormRef(pageId)} 
                                        onValueChanged={form.handleValueChanged(pageId)} 
                                        value={role && role.event_creation.toString() || CommunityRoleCreatePermission.inherit.toString()} 
                                        title={translate("form.role.event_creation")} 
                                        id={nameof("event_creation")}
                                        isRequired={false}
                                    />

                                    <SelectInput 
                                        options={communityCreateRoleOptions}
                                        errors={form.getErrors} 
                                        hasSubmitted={form.hasSubmitted()}
                                        ref={form.setFormRef(pageId)} 
                                        onValueChanged={form.handleValueChanged(pageId)} 
                                        value={role && role.project_creation.toString() || CommunityRoleCreatePermission.inherit.toString()} 
                                        title={translate("form.role.project_creation")} 
                                        id={nameof("project_creation")}
                                        isRequired={false}
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