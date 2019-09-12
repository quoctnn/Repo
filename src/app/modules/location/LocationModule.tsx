import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import classnames from "classnames"
import "./LocationModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { ContextNaturalKey, Coordinate } from '../../types/intrasocial_types';
import { connect } from 'react-redux';
import { ReduxState } from '../../redux';
import { nullOrUndefined, coordinateIsValid } from '../../utilities/Utilities';
import { Feature, Layer } from 'react-mapbox-gl';
import MapboxMapComponent, { mapLayout, mapImages } from '../../components/general/map/MapboxMapComponent';
import {ApiClient} from '../../network/ApiClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import SimpleModule from '../SimpleModule';
import { translate } from '../../localization/AutoIntlProvider';
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
type ReduxStateProps = {
    address:string
    coordinate:Coordinate
}
type ReduxDispatchProps = {
}
type Props = OwnProps & RouteComponentProps<any> & ReduxStateProps & ReduxDispatchProps
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
    componentDidMount = () => {
        this.resolveAddressIfNeeded(this.props.address)
    }
    componentDidUpdate = (prevProps:Props) => {
        if(prevProps.breakpoint != this.props.breakpoint && this.props.breakpoint < ResponsiveBreakpoint.standard && this.state.isLoading)
        {
            this.setState({isLoading:false})
        }
        this.resolveAddressIfNeeded(this.props.address)
    }
    resolveAddressIfNeeded = (address:string) => {
        if(!this.state.isResolvingAddress && address && address.length > 0 && !coordinateIsValid(this.props.coordinate) && this.state.resolvedAddress != address)
        {
            this.setState({isResolvingAddress:true}, () => {
                ApiClient.forwardGeocode(address, (location, status, error) => {
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
        const coordinate = coordinateIsValid(this.props.coordinate) && this.props.coordinate || coordinateIsValid(this.state.resolvedCoordinate) && this.state.resolvedCoordinate
        return coordinate
    }
    renderContent = () => {

        const {address} = this.props
        const addressComponents = address && address.split(",").filter(f => !nullOrUndefined(f) && f != "").map(s => s.trim()) || []
        const resolvedLocation = this.getCoordinate()
        return <>
            {addressComponents.map(c => {
                return <div key={c} className="address">{c}</div>
            })}
            {resolvedLocation && 
                <MapboxMapComponent zoom={[15]} interactive={false} center={[resolvedLocation.lon, resolvedLocation.lat]} style="mapbox://styles/mapbox/streets-v9">
                <Layer
                    type="symbol"
                    id="marker"
                    layout={mapLayout} images={mapImages} >
                    <Feature  coordinates={[resolvedLocation.lon, resolvedLocation.lat]}/>
                    </Layer>
                </MapboxMapComponent>
            }
            {this.renderContentLoading()}
            </>
    }
    render()
    {
        const {history, match, location, staticContext, contextNaturalKey, address, coordinate, ...rest} = this.props
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
const mapStateToProps = (state:ReduxState, ownProps: OwnProps & RouteComponentProps<any>):ReduxStateProps => {

    const contextObject = ContextManager.getContextObject(ownProps.location.pathname, ownProps.contextNaturalKey) as any
    const address:string = contextObject && contextObject.address
    const location:Coordinate = contextObject && contextObject.location
    return {
        address,
        coordinate:location
    }
}
const mapDispatchToProps = (dispatch:ReduxState, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(LocationModule))