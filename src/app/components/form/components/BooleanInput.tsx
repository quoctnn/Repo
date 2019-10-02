import * as React from 'react';
import { FormComponentBase, FormComponentErrorMessage } from '../FormController';
import { Input, Label, FormGroup } from 'reactstrap';
import { translate } from '../../../localization/AutoIntlProvider';
import {FormComponentBaseProps } from '../definitions';
import "./BooleanInput.scss"
export type BooleanInputProps = {
    value:boolean
    description:string
} & FormComponentBaseProps
export type BooleanInputState = {
    value?:boolean
}
export class BooleanInput extends React.Component<BooleanInputProps, BooleanInputState> implements FormComponentBase{
    constructor(props:BooleanInputProps){
        super(props)
        this.state = {
            value:this.props.value || false,
        }
    }
    getValue = () => {
        if(this.state.value == this.props.value)
            return null
        return this.state.value
    }
    isValid = () => {
        return true
    }
    getErrors = () => {
        const performValidation = this.props.hasSubmitted && this.props.isRequired
        if(!performValidation)
            return null
        let e = this.props.errors && this.props.errors([this.props.id]) || {}
        if(Object.keys(e).length > 0)
            return e
        if(!this.isValid())
        {
            e[this.props.id] = translate("input.error.length.required")
        }
        return e
    }
    sendValueChanged = () => {
        const val = this.props.value == this.state.value ? null : this.state.value
        this.props.onValueChanged && this.props.onValueChanged(this.props.id, val, this.props.isRequired)
    }
    handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked
        this.setState(() => {
            return {value:checked}
        }, this.sendValueChanged)
    }
    render = () => {
        const error = this.getErrors()
        return <div key={this.props.id} className="form-boolean-input">
                <FormGroup className="form-group form-input d-block">
                    <Label className="col-form-label d-flex" >
                        <Input className="mr-1" invalid={!!error} id={this.props.id} checked={this.state.value} type="checkbox" onChange={this.handleInputChange}/>
                        {" "}{this.props.title}
                    </Label>
                    {this.props.description && <div className="description" dangerouslySetInnerHTML={{__html:this.props.description}}></div>}
                    <FormComponentErrorMessage errors={error} errorKey={this.props.id} />
                </FormGroup>
            </div>
    }
}