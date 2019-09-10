import * as React from 'react';
import Select from 'react-select';
import { FormComponentBase, FormComponentErrorMessage, FormComponentRequiredMessage } from '../FormController';
import { InputGroup } from 'reactstrap';
import { translate } from '../../../localization/AutoIntlProvider';
import { FormComponentData, FormComponentBaseProps } from '../definitions';
import { InputOption } from './RichRadioGroupInput';
import { ActionMeta } from 'react-select/lib/types';
import classnames from 'classnames';

export class SelectInputData extends FormComponentData implements SelectInputProps{
    value:string
    placeholder?:string
    options:InputOption[]
    description?:string
    constructor(value:string, title:string, id:string, options:InputOption[], placeholder?:string, description?:string, isRequired?:boolean){
        super(title, id, isRequired)
        this.value = value
        this.placeholder = placeholder
        this.options = options
        this.description = description
    }
}
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
    getError = () => {
        if(this.props.error)
            return this.props.error
        if(!this.isValid())
            return translate("input.error.select.option.required")
    }
    sendValueChanged = () => {
        this.props.onValueChanged && this.props.onValueChanged(this.props.id, this.state.value)
    }
    handleInputChange = (value:InputOption, action: ActionMeta) => {
        this.setState(() => {
            return {value:value.value, valueSet:true}
        }, this.sendValueChanged)
    }
    render = () => {
        const error = this.getError()
        const selectedOption = this.state.value && this.props.options.find(o => o.value == this.state.value)
        const cn = classnames({"d-block":!!error})
        return <div key={this.props.id} className="form-select-input">
                <InputGroup className="form-group form-input d-block">
                    <label htmlFor={this.props.id} className="col-form-label" >
                        {this.props.title}
                        <FormComponentRequiredMessage required={this.props.isRequired} />
                    </label>
                    <FormComponentErrorMessage className={cn} error={error} />
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