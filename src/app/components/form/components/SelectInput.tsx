import * as React from 'react';
import Select from 'react-select';
import { FormComponentBase, FormComponentErrorMessage, FormComponentRequiredMessage } from '../FormController';
import { InputGroup } from 'reactstrap';
import { translate } from '../../../localization/AutoIntlProvider';
import { FormComponentBaseProps } from '../definitions';
import { InputOption } from './RichRadioGroupInput';
import classnames from 'classnames';
import { ActionMeta } from 'react-select/src/types';

export type SelectInputProps = {
    value:string
    placeholder?:string
    options:InputOption[]
    description?:string
} & FormComponentBaseProps
export type SelectInputState = {
    value?:string
    valueSet?:boolean
}
export class SelectInput extends React.Component<SelectInputProps, SelectInputState> implements FormComponentBase{
    constructor(props:SelectInputProps){
        super(props)
        this.state = {
            value:this.props.value || ""
        }
    }
    getValue = () => {
        if(this.state.value == this.props.value)
            return null
        return this.state.value
    }
    isValid = () => {
        const performValidation = this.props.hasSubmitted || this.state.valueSet
        return performValidation && this.props.isRequired ? this.state.value.trim().length > 0 : true
    }
    getErrors = () => {
        const performValidation = (this.props.hasSubmitted || this.state.valueSet) && this.props.isRequired
        if(!performValidation)
            return null
        let e = this.props.errors && this.props.errors([this.props.id]) || {}
        if(Object.keys(e).length > 0)
            return e
        if(!this.isValid())
        {
            e[this.props.id] = translate("input.error.select.option.required")
        }
        return e
    }
    sendValueChanged = () => {
        const val = this.props.value == this.state.value ? null : this.state.value
        this.props.onValueChanged && this.props.onValueChanged(this.props.id, val, this.props.isRequired)
    }
    handleInputChange = (value:InputOption, action: ActionMeta) => {
        this.setState(() => {
            return {value:value.value, valueSet:true}
        }, this.sendValueChanged)
    }
    render = () => {
        const errors = this.getErrors()
        const selectedOption = this.state.value && this.props.options.find(o => o.value == this.state.value)
        const hasError = errors && Object.keys( errors ).length > 0
        const cn = classnames({"d-block":hasError})
        return <div key={this.props.id} className="form-select-input">
                <InputGroup className="form-group form-input d-block">
                    <label htmlFor={this.props.id} className="col-form-label" >
                        {this.props.title}
                        <FormComponentRequiredMessage required={this.props.isRequired} />
                    </label>
                    <FormComponentErrorMessage className={cn} errors={errors} errorKey={this.props.id} />
                    <div className="">
                        <Select
                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        isMulti={false}
                        name={this.props.id}
                        value={selectedOption}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        onChange={this.handleInputChange}
                        placeholder={this.props.placeholder}
                        closeMenuOnSelect={true}
                        isSearchable={false}
                        options={this.props.options} />
                        {this.props.description && <div className="description">{this.props.description}</div>}
                    </div>
                </InputGroup>
            </div>
    }
}