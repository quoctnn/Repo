import * as React from 'react';
import { FormComponentBase, FormComponentErrorMessage, FormComponentRequiredMessage } from '../FormController';
import { InputGroup, Input, Button, InputGroupAddon } from 'reactstrap';
import { translate } from '../../../localization/AutoIntlProvider';
import { FormComponentBaseProps } from '../definitions';
import classnames from 'classnames';
import { Coordinate } from '../../../types/intrasocial_types';
import ReactMapboxGl from 'react-mapbox-gl';
import { Settings } from '../../../utilities/Settings';
import "./LocationInput.scss"
import { ApiClient, MapBoxFeature } from '../../../network/ApiClient';
import CursorList, { CursorListItem } from '../../general/input/contextsearch/CursorList';
import { uniqueId } from '../../../utilities/Utilities';

const Map = ReactMapboxGl({
    accessToken: Settings.mapboxAccessToken,
    interactive:true
})
export type LocationInputProps = {
    location:Coordinate
} & FormComponentBaseProps
export type LocationInputState = {
    value?:Coordinate
    initialLocation?:Coordinate
    valueSet?:boolean
    userLocation:Position
    zoom:number
    searchInputVisible:boolean
    searchQuery:string
    requestId:number
    autocompleteData:MapBoxFeature[]
    autocompleteDataId:string
}
export class LocationInput extends React.Component<LocationInputProps, LocationInputState> implements FormComponentBase{
    private defaultLocation:[number, number] = [-0.1148677, 51.5139573]
    onIdleTimout: NodeJS.Timer = null
    searchIdleTimout: NodeJS.Timer = null
    searchRef = React.createRef<HTMLInputElement>()
    constructor(props:LocationInputProps){
        super(props)
        this.state = {
            value:this.props.location,
            initialLocation:this.props.location,
            userLocation:null,
            zoom:15,
            searchInputVisible:false,
            searchQuery:"",
            requestId:0,
            autocompleteData:[],
            autocompleteDataId:uniqueId(),
        }
        this.getBrowserLocation()
    }
    componentWillUnmount = () => {
        document.removeEventListener('click', this.handleSearchBlur);
    }
    componentDidUpdate = (prevProps:LocationInputProps, prevState:LocationInputState) => {
        const visibilityChanged = prevState.searchInputVisible != this.state.searchInputVisible
        if(visibilityChanged)
        {
            if(this.state.searchInputVisible)
                document.addEventListener('click', this.handleSearchBlur)
            else
                document.removeEventListener('click', this.handleSearchBlur)
        }
    }
    shouldComponentUpdate = (nextProps:LocationInputProps, nextState:LocationInputState) => {
        return nextProps.errors != this.props.errors ||
                nextProps.hasSubmitted != this.props.hasSubmitted || 
                nextState.value != this.state.value || 
                nextProps.id != this.props.id || 
                nextProps.location != this.props.location || 
                nextState.zoom != this.state.zoom || 
                nextState.userLocation != this.state.userLocation || 
                nextState.searchInputVisible != this.state.searchInputVisible || 
                nextState.searchQuery != this.state.searchQuery || 
                nextState.autocompleteDataId != this.state.autocompleteDataId
    }
    getValue = () => {
        if(this.state.value == this.props.location)
            return null
        return this.state.value
    }
    isValid = () => {
        const performValidation = this.props.hasSubmitted || this.state.valueSet
        return performValidation && this.props.isRequired ? Coordinate.isValid( this.state.value ) : true
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
        const val = Coordinate.equals(this.props.location, this.state.value) ? null : this.state.value
        this.props.onValueChanged && this.props.onValueChanged(this.props.id, val, this.props.isRequired)
    }
    getBrowserLocation() {
        navigator.geolocation && navigator.geolocation.getCurrentPosition((position: Position) => {
            this.setState(() => {
                return {userLocation:position}
            })
        })
    }
    getUserLocation = ():[number, number] => {
        return this.state.userLocation && this.state.userLocation.coords && [this.state.userLocation.coords.longitude, this.state.userLocation.coords.latitude]
    }
    sendValueOnIdle = () => {
        if(this.onIdleTimout)
            clearTimeout(this.onIdleTimout)
        this.onIdleTimout = setTimeout(this.sendValueChanged, 500)
    }
    searhQueryOnIdle = (query:string) => () => {
        if(this.searchIdleTimout)
            clearTimeout(this.searchIdleTimout)
        this.searchIdleTimout = setTimeout(this.search(query), 300)
    }
    onMapMoveEnd = (map: any, evt: React.SyntheticEvent<any>) => {
        const location = map.getCenter()
        const zoom:number = map.getZoom()
        const coordinate:Coordinate = {lat:location.lat, long:location.lng}
        if(!Coordinate.equals(coordinate, this.state.value))
        {
            this.setState(() => {
                return {value:coordinate, zoom}
            }, this.sendValueOnIdle)
        }
    }
    search = (query:string) => () => {
        this.setState((prevState:LocationInputState) => {
            return {requestId:prevState.requestId + 1}
        }, () => {
            if(!query)
            {
                this.setState(() => {
                    return {autocompleteData:[], autocompleteDataId:uniqueId()}
                })
            }
            else {
                const requestId = this.state.requestId
                ApiClient.placeAutocomple(query, (features, status, error) => {
                    if(requestId == this.state.requestId)
                    {
                        this.setState(() => {
                            return {autocompleteData:features || [], autocompleteDataId:uniqueId()}
                        })
                    }
                })
            }
        })
    }

    focusSearchInput = () => {
        this.searchRef && this.searchRef.current && this.searchRef.current.focus()
    }
    blurSearchInput = () => {
        this.searchRef && this.searchRef.current && this.searchRef.current.blur()
    }
    hideSearchInput = () => {
        const isVisible = this.state.searchInputVisible
        if(isVisible)
        {
            this.setState((prevState:LocationInputState) => {
                return {searchInputVisible:false}
            })
            this.blurSearchInput()
        }
    }
    showSearchInput = () => {
        if(!this.state.searchInputVisible)
        {
            this.setState((prevState:LocationInputState) => {
                return {searchInputVisible:true}
            }, this.focusSearchInput)
        }
    }
    toggleSearchInput = () => {
        const isVisible = this.state.searchInputVisible
        if(isVisible)
        {
            this.hideSearchInput()
        }
        else {
            this.showSearchInput()
        }
    }
    handleSearchBlur = (event:MouseEvent) => {
        const el = event.target as HTMLElement
        const searchEl = this.searchRef && this.searchRef.current
        if(el && searchEl)
        {
            if(searchEl != el && !searchEl.contains(el))
                this.hideSearchInput()
        }
        else 
            this.hideSearchInput()
    }
    handleInputChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        this.setState(() => {
            return {searchQuery:value}
        }, this.searhQueryOnIdle(value))
    }
    didSelectAutocomplete = (feature:MapBoxFeature) => () => {
        this.hideSearchInput()
        if(feature && feature.center)
        {
            const center = feature.center
            const coordinate:Coordinate = {lat:center[1], long:center[0]}
            this.setState(() => {
                return {value:coordinate}
            }, this.sendValueOnIdle)
        }
    }
    render = () => {
        const errors = this.getErrors()
        const hasError = errors && Object.keys( errors ).length > 0
        const cn = classnames({"d-block":hasError})
        const coordinate:[number, number] = this.state.value && [this.state.value.long, this.state.value.lat] || this.getUserLocation() || this.defaultLocation
        const sbCn = classnames("searchbar-container", {active:this.state.searchInputVisible})
        return <div key={this.props.id} className="form-location-input">
                <InputGroup className="form-group form-input d-block">
                    <label htmlFor={this.props.id} className="col-form-label" >
                        {this.props.title}
                        <FormComponentRequiredMessage required={this.props.isRequired} />
                    </label>
                    <div className="">
                    <Map onMoveEnd={this.onMapMoveEnd} className="form-location-input-component" zoom={[this.state.zoom]} center={coordinate} style="mapbox://styles/mapbox/streets-v9">
                        <div className="crosshairs-container"><div className="crosshairs"></div></div>
                        <div className={sbCn}>
                            <div className="searchbar">
                                <InputGroup>
                                    <Input onChange={this.handleInputChange} value={this.state.searchQuery} innerRef={this.searchRef} className="search_input" type="text" name="" placeholder="Search..." />
                                    <InputGroupAddon addonType="append">
                                        <Button onClick={this.toggleSearchInput} className="search_icon"><i className="fas fa-search"></i></Button>
                                    </InputGroupAddon>
                                </InputGroup>
                                {this.state.searchInputVisible && <div className="autocomplete-list">
                                    <CursorList items=
                                    {this.state.autocompleteData.map(a => {
                                        return <CursorListItem key={a.id} onSelect={this.didSelectAutocomplete(a)}>
                                            <div>{a.place_name}</div>
                                        </CursorListItem>
                                    })}
                                    >
                                    </CursorList>
                                </div>}
                            </div>
                        </div>
                    </Map>
                        <FormComponentErrorMessage className={cn} errors={errors} errorKey={this.props.id} />
                    </div>
                </InputGroup>
            </div>
    }
}