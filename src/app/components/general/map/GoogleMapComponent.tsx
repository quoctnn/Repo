import * as React from "react";
import "./GoogleMapComponent.scss"
import {Map, InfoWindow, Marker, GoogleApiWrapper, GoogleAPI, ProvidedProps, MapProps, GoogleApiOptions} from 'google-maps-react';

type Props = {
} & MapProps
const MapComp= (props:Props) => {
    return (<Map {...props} google={props.google} zoom={14} />)
}
const MapWrapped = GoogleApiWrapper({
    apiKey: "AIzaSyBvI4wy3GApbq3_NGs2hgX9ph1TUrNzBAE"
  })(MapComp)
type T = Pick<MapProps, Exclude<keyof MapProps, keyof ProvidedProps>> & {children:React.ReactNode}
const MapComponent = (props: T) => {
    return <div className="map-component"><MapWrapped {...props } /></div>
}
export default MapComponent