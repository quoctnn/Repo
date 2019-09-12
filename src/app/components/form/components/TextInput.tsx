import * as React from 'react';
import { FormComponentBase, FormComponentErrorMessage, FormComponentRequiredMessage } from '../FormController';
import { InputGroup, Input } from 'reactstrap';
import { translate } from '../../../localization/AutoIntlProvider';
import { FormComponentData, FormComponentBaseProps } from '../definitions';

export class TextInputData extends FormComponentData implements TextInputProps{
    value:string
    placeholder?:string
    constructor(value:string, title:string, id:string, placeholder?:string, isRequired?:boolean){
        super(title, id, isRequired)
        this.value = value
        this.placeholder = placeholder
    }
}
export type TextInputProps = {
    value:string
    placeholder?:string
} & FormComponentBaseProps
export type TextInputState = {
    value?:string
    valueSet?:boolean
}
export class TextInput extends React.Component<TextInputProps, TextInputState> implements FormComponentBase{
    constructor(props:TextInputProps){
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
            return translate("input.error.length.required")
    }
    sendValueChanged = () => {
        this.props.onValueChanged && this.props.onValueChanged(this.props.id, this.state.value)
    }
    handleInputChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        this.setState(() => {
            return {value, valueSet:true}
        }, this.sendValueChanged)
    }
    render = () => {
        const error = this.getError()
        return <div key={this.props.id} className="form-text-input">
                <InputGroup className="form-group form-input d-block">
                    <label htmlFor={this.props.id} className="col-form-label" >
                        {this.props.title}
                        <FormComponentRequiredMessage required={this.props.isRequired} />
                    </label>
                    <div className="">
                        <Input invalid={!!error} id={this.props.id} value={this.state.value} type="text" onChange={this.handleInputChange} placeholder={this.props.placeholder}/>
                        <FormComponentErrorMessage error={error} />
                    </div>
                </InputGroup>
            </div>
    }
}