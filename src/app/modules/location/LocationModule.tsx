import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import classnames from "classnames"
import "./LocationModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { ContextNaturalKey, Coordinate } from '../../types/intrasocial_types';
import { nullOrUndefined, coordinateIsValid } from '../../utilities/Utilities';
import { Feature, Layer } from 'react-mapbox-gl';
import MapboxMapComponent, { mapLayout, mapImages } from '../../components/general/map/MapboxMapComponent';
import {ApiClient} from '../../network/ApiClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import SimpleModule from '../SimpleModule';
import { translate } from '../../localization/AutoIntlProvider';
import { ContextDataProps, withContextData } from '../../hoc/WithContextData';
import { ContextManager } from '../../managers/ContextManager';
type OwnProps = {
    className?:string
    breakpoint:ResponsiveBreakpoint
    contextNaturalKey?:ContextNaturalKey
}
type State = {
    isLoading:boolean
    resolvedCoordinate:Coordinate
    resolvedAddress:string
    isResolvingAddress:boolean
}
type LocationData = {
    location: Coordinate
    address: string
}
type Props = OwnProps & RouteComponentProps<any> & ContextDataProps
class LocationModule extends React.Component<Props, State> {  
    constructor(props:Props) {
        super(props);
        this.state = {
            isLoading:false,
            resolvedCoordinate:undefined,
            resolvedAddress:undefined,
            isResolvingAddress:false
        }
    }
    getContextObject = ():LocationData => {
        const contextObject = this.props.contextData.getContextObject(this.props.contextNaturalKey)
        return contextObject as any as LocationData
    }
    getAddress = () => {
        const contextObject = this.getContextObject()
        return contextObject && contextObject.address
    }
    getLocation = () => {
        const contextObject = this.getContextObject()
        return contextObject && contextObject.location
    }
    componentDidMount = () => {
        this.resolveAddressIfNeeded(this.getAddress())
    }
    componentDidUpdate = (prevProps:Props) => {
        if(prevProps.breakpoint != this.props.breakpoint && this.props.breakpoint < ResponsiveBreakpoint.standard && this.state.isLoading)
        {
            this.setState({isLoading:false})
        }
        this.resolveAddressIfNeeded(this.getAddress())
    }
    resolveAddressIfNeeded = (address:string) => {
        const coordinate = this.getLocation()
        if(!this.state.isResolvingAddress && address && address.length > 0 && !coordinateIsValid(coordinate) && this.state.resolvedAddress != address)
        {
            this.setState({isResolvingAddress:true}, () => {
                ApiClient.forwardGeocode(address, (features, status, error) => {
                    const location:Coordinate = features && features.length > 0 && features[0].center && {lat:features[0].center[1], long:features[0].center[0]}
                    this.setState({resolvedCoordinate:location, resolvedAddress:address, isResolvingAddress:false})
                })
            })
        }
    }
    headerClick = (e) => {
        //NavigationUtilities.navigateToNewsfeed(this.props.history, context && context.type, context && context.id, this.state.includeSubContext)
    }
    renderContentLoading = () => {
        if (this.state.isResolvingAddress) {
            return (<LoadingSpinner key="loading1"/>)
        }
    }
    getCoordinate = () => {
        const contextCoordinate = this.getLocation()
        const coordinate = coordinateIsValid(contextCoordinate) && contextCoordinate || coordinateIsValid(this.state.resolvedCoordinate) && this.state.resolvedCoordinate
        return coordinate
    }
    renderContent = () => {

        const address = this.getAddress()
        const addressComponents = address && address.split(",").filter(f => !nullOrUndefined(f) && f != "").map(s => s.trim()) || []
        const resolvedLocation = this.getCoordinate()
        return <>
            {addressComponents.map(c => {
                return <div key={c} className="address">{c}</div>
            })}
            {resolvedLocation && 
                <MapboxMapComponent zoom={[15]} interactive={false} center={[resolvedLocation.long, resolvedLocation.lat]} style="mapbox://styles/mapbox/streets-v9">
                <Layer
                    type="symbol"
                    id="marker"
                    layout={mapLayout} images={mapImages} >
                    <Feature  coordinates={[resolvedLocation.long, resolvedLocation.lat]}/>
                    </Layer>
                </MapboxMapComponent>
            }
            {this.renderContentLoading()}
            </>
    }
    render()
    {
        const {history, match, location, staticContext, contextNaturalKey, contextData, ...rest} = this.props
        const {breakpoint, className} = this.props
        const cn = classnames("location-module", className)
        return (<SimpleModule {...rest} 
                    className={cn} 
                    headerClick={this.headerClick} 
                    breakpoint={breakpoint} 
                    isLoading={this.state.isLoading} 
                    headerTitle={translate("location.module.title")}>
                {this.renderContent()}
                </SimpleModule>)
    }
}
export default withContextData(withRouter(LocationModule))