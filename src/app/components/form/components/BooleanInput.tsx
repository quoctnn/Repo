import * as React from 'react';
import { FormComponentBase, FormComponentErrorMessage } from '../FormController';
import { InputGroup, Input, Label, FormGroup } from 'reactstrap';
import { translate } from '../../../localization/AutoIntlProvider';
import { FormComponentData, FormComponentBaseProps } from '../definitions';
import "./BooleanInput.scss"
export class BooleanInputData extends FormComponentData implements BooleanInputProps{
    value:boolean
    description:string
    constructor(value:boolean, title:string, id:string, description:string){
        super(title, id, false)
        this.value = value
        this.description = description
    }
}
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
    getError = () => {
        if(this.props.error)
            return this.props.error
        if(!this.isValid())
            return translate("input.error.length.required")
    }
    sendValueChanged = () => {
        this.props.onValueChanged && this.props.onValueChanged(this.props.id, this.state.value)
    }
    handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked
        this.setState(() => {
            return {value:checked}
        }, this.sendValueChanged)
    }
    render = () => {
        const error = this.getError()
        return <div key={this.props.id} className="form-boolean-input">
                <FormGroup className="form-group form-input d-block">
                    <Label className="col-form-label d-flex" >
                        <Input className="mr-1" invalid={!!error} id={this.props.id} checked={this.state.value} type="checkbox" onChange={this.handleInputChange}/>
                        {" "}{this.props.title}
                    </Label>
                    {this.props.description && <div className="description">{this.props.description}</div>}
                    <FormComponentErrorMessage error={error} />
                </FormGroup>
            </div>
    }
}