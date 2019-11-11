import * as React from 'react';
import { FormComponentBase, FormComponentErrorMessage, FormComponentRequiredMessage } from '../FormController';
import { InputGroup, Input, InputGroupAddon, Label } from 'reactstrap';
import { translate } from '../../../localization/AutoIntlProvider';
import { FormComponentBaseProps } from '../definitions';
import classnames from 'classnames';
import { Coordinate } from '../../../types/intrasocial_types';
import { ApiClient } from '../../../network/ApiClient';

export type AddressInputProps = {
    address:string
    placeholder?:string
    location?:Coordinate
} & FormComponentBaseProps
export type AddressInputState = {
    value?:string
    valueSet?:boolean
    resolveAddressFromLocation:boolean
    resolvedFrom:Coordinate
    isResolvingAddress:boolean
}
export class AddressInput extends React.Component<AddressInputProps, AddressInputState> implements FormComponentBase{
    constructor(props:AddressInputProps){
        super(props)
        this.state = {
            value:this.props.address || "",
            resolveAddressFromLocation:!this.props.address,
            resolvedFrom:null,
            isResolvingAddress:false
        }
    }
    componentDidMount = () => {
        this.resolveIfNeeded()
    }
    resolveIfNeeded = () => {
        if(this.state.resolveAddressFromLocation && !!this.props.location && !Coordinate.equals(this.props.location, this.state.resolvedFrom))
        {
            this.resolveAddress(this.props.location)
        }
    }
    componentDidUpdate = (prevProps:AddressInputProps, prevState:AddressInputState) => {
        const newLocation = this.props.location
        if(!this.state.isResolvingAddress && this.state.resolveAddressFromLocation && !!newLocation && !Coordinate.equals(prevProps.location, newLocation) && !Coordinate.equals(newLocation, this.state.resolvedFrom))
        {//resolve on && location changed && location != lastResolvedLocation
            this.resolveAddress(newLocation)
        }
    }
    resolveAddress = (location:Coordinate) => {
        this.setState({isResolvingAddress:true}, () => {
            ApiClient.reverseGeocode(location, (features, status, error) => {
                this.setState(() => {
                    const address = features && features.length > 0 && features[0].place_name
                    return {resolvedFrom:location, value:address, isResolvingAddress:false}
                },this.sendValueChanged)
            })
        })
    }
    getValue = () => {
        if(this.state.value == this.props.address)
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
            e[this.props.id] = translate("input.error.length.required")
        }
        return e
    }
    sendValueChanged = () => {
        const val = this.props.address == this.state.value ? null : this.state.value
        this.props.onValueChanged && this.props.onValueChanged(this.props.id, val, this.props.isRequired)
    }
    handleInputChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        this.setState(() => {
            return {value, valueSet:true, resolveAddressFromLocation:false, resolvedFrom:null}
        }, this.sendValueChanged)
    }
    handleCheckboxChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked
        const callback = checked ?  this.resolveIfNeeded : undefined
        this.setState(() => {
            return {resolveAddressFromLocation:checked}
        },callback)
    }
    render = () => {
        const errors = this.getErrors()
        const hasError = errors && Object.keys( errors ).length > 0
        const cn = classnames({"d-block":hasError})
        const value = this.state.value || ""
        return <div key={this.props.id} className="form-address-input">
                <InputGroup className="form-group form-input d-block">
                    <label htmlFor={this.props.id} className="col-form-label" >
                        {this.props.title}
                        <FormComponentRequiredMessage required={this.props.isRequired} />
                    </label>
                    <div className="">
                    <InputGroup>
                        <InputGroupAddon addonType="prepend">
                            <Label className="input-group-text">
                                <Input addon={true} type="checkbox" checked={this.state.resolveAddressFromLocation} onChange={this.handleCheckboxChange}/>
                                <span className="ml-1">{translate("common.update")}</span>
                            </Label>
                        </InputGroupAddon>
                        <Input invalid={hasError} id={this.props.id} value={value} type="text" onChange={this.handleInputChange} placeholder={this.props.placeholder}/>
                        <FormComponentErrorMessage className={cn} errors={errors} errorKey={this.props.id} />
                    </InputGroup>
                    </div>
                </InputGroup>
            </div>
    }
}