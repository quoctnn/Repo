import * as React from 'react';
import { FormComponentBase, FormComponentErrorMessage, FormComponentRequiredMessage } from '../FormController';
import { InputGroup } from 'reactstrap';
import { translate } from '../../../localization/AutoIntlProvider';
import { FormComponentBaseProps } from '../definitions';
import classnames from 'classnames';
import { ProfileSelector } from '../../general/contextMembers/ProfileSelector';
import { UserProfile } from '../../../types/intrasocial_types';
export type ProfileSelectInputProps = {
    allowedProfiles:UserProfile[]
    selectedProfiles:UserProfile[]
    placeholder?:string
    description?:string
} & FormComponentBaseProps
export type ProfileSelectInputState = {
    value:number[]
    valueSet?:boolean
}
export class ProfileSelectInput extends React.Component<ProfileSelectInputProps, ProfileSelectInputState> implements FormComponentBase{
    constructor(props:ProfileSelectInputProps){
        super(props)
        this.state = {
            value:props.selectedProfiles.map(p => p.id)
        }
    }
    getValue = () => {
        const input = this.props.selectedProfiles.map(p => p.id)
        if(this.state.value.isEqual(input))
            return null
        return this.state.value
    }
    isValid = () => {
        const performValidation = (this.props.hasSubmitted || this.state.valueSet) && this.props.isRequired
        if(performValidation)
        {
            return this.state.value.length > 0
        }
        return true
    }
    getErrors = () => {
        let e = this.props.errors && this.props.errors([this.props.id]) || {}
        if(Object.keys(e).length > 0)
            return e
        const performValidation = (this.props.hasSubmitted || this.state.valueSet) && this.props.isRequired
        if(!performValidation)
                return null
        if(!this.isValid())
        {
            e[this.props.id] = translate("input.error.select.option.required")
        }
        return e
    }
    handleProfileSelectorChange = (profiles:UserProfile[]) => {
        this.setState((prevState:ProfileSelectInputState) => {
            const users = profiles.map(p => p.id)
            return {value:users}
        }, () => {
            this.props.onValueChanged(this.props.id, this.state.value, this.props.isRequired)
        })
    }
    render = () => {
        const errors = this.getErrors()
        const hasError = errors && Object.keys( errors ).length > 0
        const cn = classnames({"d-block":hasError})
        return <div key={this.props.id} className="form-select-input">
                <InputGroup className="form-group form-input d-block">
                    <label htmlFor={this.props.id} className="col-form-label" >
                        {this.props.title}
                        <FormComponentRequiredMessage required={this.props.isRequired} />
                    </label>
                    <FormComponentErrorMessage className={cn} errors={errors} errorKey={this.props.id} />
                    <ProfileSelector placeholder={this.props.placeholder} selectedProfiles={this.props.selectedProfiles} allowedProfiles={this.props.allowedProfiles} onValueChange={this.handleProfileSelectorChange} />
                    {this.props.description && <div className="description" dangerouslySetInnerHTML={{__html:this.props.description}}></div>}
                </InputGroup>
            </div>
    }
}