import * as React from 'react';
import { InputGroup } from 'reactstrap';
import { FormComponentBase, FormComponentErrorMessage, FormComponentRequiredMessage } from '../FormController';
import { translate } from '../../../localization/AutoIntlProvider';
import classnames from 'classnames';
import { FormComponentBaseProps } from '../definitions';

export type InputOption = {
    label:string 
    value:string
    description?:string 
    icon?:string
}
export type RichRadioGroupInputProps = {
    value:string
    options:InputOption[]
} & FormComponentBaseProps
export type RichRadioGroupInputState = {
    value?:string
    valueSet?:boolean
}
export class RichRadioGroupInput extends React.Component<RichRadioGroupInputProps, RichRadioGroupInputState> implements FormComponentBase{
    constructor(props:RichRadioGroupInputProps){
        super(props)
        this.state = {
            value:props.value || "",
            valueSet:false
        }
    }
    getValue = () => {
        if(this.state.value == this.props.value)
            return null
        return this.state.value
    }
    isValid = () => {
        const performValidation = this.props.hasSubmitted || this.state.valueSet
        return performValidation && this.props.isRequired ? !!this.state.value: true
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
    handleValueChange = (value:string) => (e:React.SyntheticEvent) => {
        this.setState(() => {
            return {value, valueSet:true}
        }, this.sendValueChanged)
    }
    render = () => {
        const errors = this.getErrors()
        const hasError = errors && Object.keys( errors ).length > 0
        const cn = classnames({"d-block":hasError})
        const options = this.props.options
        return <div key={this.props.id} className="form-rich-radio-input">
                <InputGroup className="form-group form-input d-block">
                    <label className="col-form-label">
                        {this.props.title}
                        <FormComponentRequiredMessage required={this.props.isRequired} />
                    </label>
                    <FormComponentErrorMessage className={cn} errors={errors} errorKey={this.props.id} />
                    {options.map((option, i) => {
                        const selected = option.value == this.state.value
                        const cn = classnames("d-flex form-rich-radio-input-option", {selected:selected})
                        const iconCn = classnames("option-icon", option.icon)
                        return <div onClick={this.handleValueChange(option.value)} key={option.value} className={cn}>
                            <i className={iconCn}></i>
                            <div className="ml-2 d-flex flex-column option-content">
                                <div className="name">{option.label}</div>
                                <div className="description">{option.description}</div>
                            </div>
                            <div className="ml-2 option-status">
                                {selected && <i className="fas fa-check"></i>}
                            </div>
                        </div>
                    })}
                </InputGroup>
            </div>
    }
}