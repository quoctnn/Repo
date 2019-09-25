import * as React from 'react';
import { FormComponentBase, FormComponentErrorMessage, FormComponentRequiredMessage } from '../FormController';
import { InputGroup, Popover, PopoverBody } from 'reactstrap';
import { translate } from '../../../localization/AutoIntlProvider';
import {  FormComponentBaseProps } from '../definitions';
import { SketchPicker, ColorResult } from 'react-color';
import "./ColorInput.scss"
import classnames from 'classnames';
import Popper from 'popper.js';
export type ColorInputProps = {
    value:string
} & FormComponentBaseProps
export type ColorInputState = {
    value?:string
    popoverRemoved:boolean
    popoverVisible:boolean
}
export class ColorInput extends React.Component<ColorInputProps, ColorInputState> implements FormComponentBase{
    private triggerRef = React.createRef<any>()
    constructor(props:ColorInputProps){
        super(props)
        this.state = {
            value:this.props.value || "#ddddddd",
            popoverRemoved:true,
            popoverVisible:false
        }
    }
    getValue = () => {
        if(this.state.value == this.props.value)
            return null
        return this.state.value
    }
    isValid = () => {
        return this.props.isRequired ? this.state.value.trim().length > 0 : true
    }
    getErrors = () => {
        const performValidation = this.props.hasSubmitted  && this.props.isRequired
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
    handleInputChange = (color: ColorResult) => {
        this.setState(() => {
            return {value:color.hex}
        }, this.sendValueChanged)
    }
    onTriggerClick = (e:React.SyntheticEvent) => {
        e.preventDefault()
        if(!this.state.popoverRemoved)
        {
            this.closePopoverPanel()
        }
        else {
            this.setState( (prevState) => {
                return {popoverRemoved:false, popoverVisible:true}
            })
        }
    }
    closePopoverPanel = () => {
        const completion = () => {
            setTimeout(() => {
                this.setState( (prevState) => {
                    return {popoverVisible:false, popoverRemoved:true}
                })
            }, 300)
        }
        this.setState( (prevState) => {
            return {popoverVisible:false}
        },completion)
    }
    renderPopover = () =>
    {
        const open = !this.state.popoverRemoved || this.state.popoverVisible
        if(!open)
            return null
            
        const modifiers:Popper.Modifiers = {flip: { behavior: ['bottom', 'top', 'bottom'] } }
        return <Popover className="dropdown-color-input"
                        delay={0} 
                        trigger="legacy" 
                        placement="bottom" 
                        hideArrow={false} 
                        isOpen={this.state.popoverVisible} 
                        target={this.triggerRef.current} 
                        toggle={this.closePopoverPanel}
                        modifiers={modifiers}
                        >
                    <PopoverBody className="pl-0 pr-0">
                        <SketchPicker
                                    color={ this.state.value }
                                    onChangeComplete={ this.handleInputChange }
                                />
                    </PopoverBody>
                </Popover>
    }
    render = () => {
        const errors = this.getErrors()
        const hasError = errors && Object.keys( errors ).length > 0
        const cn = classnames({"d-block":hasError})
        return <div key={this.props.id} className="form-color-input">
                <InputGroup className="form-group form-input d-block">
                    <label htmlFor={this.props.id} className="col-form-label" >
                        {this.props.title}
                        <FormComponentRequiredMessage required={this.props.isRequired} />
                    </label>
                    <div className="d-flex">
                        <div ref={this.triggerRef} className="color-input-container" onClick={this.onTriggerClick}>
                            <div className="color-input" style={{background:this.state.value}}>
                            </div>
                        </div>
                    </div>
                    <FormComponentErrorMessage errors={errors} errorKey={this.props.id} className={cn}/>
                </InputGroup>
                {this.renderPopover()}
            </div>
    }
}