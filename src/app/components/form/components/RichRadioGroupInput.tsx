import * as React from 'react';
import { InputGroup } from 'reactstrap';
import { FormComponentBase, FormComponentErrorMessage, FormComponentRequiredMessage } from '../FormController';
import { translate } from '../../../localization/AutoIntlProvider';
import classnames from 'classnames';
import { FormComponentData, FormComponentBaseProps } from '../definitions';

export type InputOption = {
    label:string 
    value:string
    description?:string 
    icon?:string
}
export class RichRadioGroupInputData extends FormComponentData implements RichRadioGroupInputProps{
    value:string
    options:InputOption[]
    constructor(value:string, title:string, id:string, options:InputOption[], isRequired?:boolean){
        super(title, id, isRequired)
        this.value = value
        this.options = options
    }
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
            value:this.props.value || "",
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
    getError = () => {
        if(this.props.error)
            return this.props.error
        if(!this.isValid())
            return translate("input.error.select.option.required")
    }
    sendValueChanged = () => {
        this.props.onValueChanged && this.props.onValueChanged(this.props.id, this.state.value)
    }
    handleValueChange = (value:string) => (e:React.SyntheticEvent) => {
        this.setState(() => {
            return {value, valueSet:true}
        }, this.sendValueChanged)
    }
    render = () => {
        const error = this.getError()
        const options = this.props.options
        const cn = classnames({"d-block":!!error})
        return <div key={this.props.id} className="form-rich-radio-input">
                <InputGroup className="form-group form-input d-block">
                    <label className="col-form-label">
                        {this.props.title}
                        <FormComponentRequiredMessage required={this.props.isRequired} />
                    </label>
                    <FormComponentErrorMessage className={cn} error={error} />
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