import * as React from "react";
import "./CoverModule.scss"
import { ResponsiveBreakpoint } from "../../components/general/observers/ResponsiveComponent";
import { ContextNaturalKey, Permissible, Favorite, IdentifiableObject } from '../../types/intrasocial_types';
import classnames = require("classnames");
import SimpleModule from "../SimpleModule";
import { ReduxState } from "../../redux";
import { connect, DispatchProp } from "react-redux";
import { withRouter, RouteComponentProps } from "react-router";
import { ContextManager } from "../../managers/ContextManager";
import { contextCover } from '../../utilities/Utilities';
import { CoverImage } from '../../components/general/CoverImage';
import { FavoriteManager } from '../../managers/FavoriteManager';
import { Button } from "reactstrap";

type OwnProps = 
{
    className?:string
    breakpoint:ResponsiveBreakpoint
    contextNaturalKey?:ContextNaturalKey
    height?:number
}
type Props = OwnProps & ReduxStateProps & RouteComponentProps<any> & DispatchProp
type ReduxStateProps = {
    contextObject:Permissible & IdentifiableObject
    favorite:Favorite
}
type State = {
}
class CoverModule extends React.Component<Props, State> {
    constructor(props:Props) {
        super(props);
        this.state = {
        }
    }
    renderContent = () => {
        const cover = contextCover(this.props.contextObject, this.props.contextNaturalKey, false)
        const isFavorite = !!this.props.favorite
        const cn = classnames("favorite-button", {active:isFavorite})
        const icon = isFavorite ? "fas fa-star" : "far fa-star"
        return <CoverImage className="flex-grow-1" src={cover} >
                    <Button onClick={this.toggleFavorite} color="link" className={cn}>
                        <i className={icon}></i>
                    </Button>
                </CoverImage>
    }
    toggleFavorite = () => {
        if(!!this.props.favorite)
            FavoriteManager.removeFavorite(this.props.favorite.id)
        else 
            FavoriteManager.createFavorite(this.props.contextNaturalKey, this.props.contextObject.id)
    }
    render() {
        const {contextNaturalKey, height, history, match, location, contextObject, staticContext, dispatch, ...rest} = this.props
        const {breakpoint, className} = this.props
        const cn = classnames("cover-module d-flex", className)
        return (<SimpleModule style={{height:this.props.height}} {...rest} 
                    className={cn} 
                    breakpoint={breakpoint} 
                    isLoading={false} 
                    showHeader={false}
                    >
                    {this.renderContent()}
                </SimpleModule>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps:Props) => {
    const resolved = ContextManager.getContextObject(ownProps.location.pathname, ownProps.contextNaturalKey)
    const favorite = !!resolved && state.favoriteStore.allIds.map(id => state.favoriteStore.byId[id]).find(o => o.object_id == resolved.id && o.object_natural_key == ownProps.contextNaturalKey)
    return {
        contextObject:resolved,
        favorite:favorite
    }
}
export default withRouter(connect<ReduxStateProps, null, OwnProps>(mapStateToProps, null)(CoverModule));