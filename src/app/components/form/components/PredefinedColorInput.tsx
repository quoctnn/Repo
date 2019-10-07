import * as React from 'react';
import { FormComponentBase, FormComponentErrorMessage, FormComponentRequiredMessage } from '../FormController';
import { InputGroup} from 'reactstrap';
import { translate } from '../../../localization/AutoIntlProvider';
import {  FormComponentBaseProps } from '../definitions';
import "./PredefinedColorInput.scss"
import classnames from 'classnames';
export type PredefinedColorInputProps = {
    value:string
} & FormComponentBaseProps
export type PredefinedColorInputState = {
    value?:string
    popoverRemoved:boolean
    popoverVisible:boolean
}
export const predefinedColors = 
    ["#E91D63", "#F44336", "#EA5020", "#FF9800", "#F69300", "#FFEB3B",
     "#CDDC39", "#8BC34A", "#4CAF4F", "#009688", "#00BCD4", "#04A9F4"].map(c => c.toLowerCase())

export const ColorPicker = (props:{color:string, colors:string[], onChange:(color:string) => void}) => {
    
    const onClick = (color:string) => () => {
        props.onChange(color)
    }
    const renderItem = (color:string) => {
        const active = color == props.color
        const cl = classnames("color-item", {"active":active})
        return <div onClick={onClick(color)} key={color} className={cl} style={{backgroundColor:color}}>
                    {active && <i className="fas fa-check"></i>}
                </div>
    }
    const aLength = Math.floor(props.colors.length / 2)
    const a = props.colors.slice(0, aLength)
    const b = props.colors.slice(aLength)
    return <div className="color-picker">
                <div className="top">{a.map(renderItem)}</div>
                <div className="bottom">{b.map(renderItem)}</div>
            </div>
}
export class PredefinedColorInput extends React.Component<PredefinedColorInputProps, PredefinedColorInputState> implements FormComponentBase{
    constructor(props:PredefinedColorInputProps){
        super(props)
        let c = props.value && props.value.toLowerCase() 
        if(c && !predefinedColors.contains(c))
            c = null
        this.state = {
            value:c,
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
        return this.props.isRequired ? this.state.value && predefinedColors.contains(this.state.value) : true
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
    handleInputChange = (color: string) => {
        this.setState(() => {
            return {value:color}
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
                    <ColorPicker onChange={this.handleInputChange} colors={predefinedColors} color={this.state.value} />
                    <FormComponentErrorMessage errors={errors} errorKey={this.props.id} className={cn}/>
                </InputGroup>
            </div>
    }
}