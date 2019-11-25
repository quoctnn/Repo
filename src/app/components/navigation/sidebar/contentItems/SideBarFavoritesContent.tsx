import * as React from "react";
import { Favorite } from '../../../../types/intrasocial_types';
import { ApiClient } from '../../../../network/ApiClient';
import "../SideBarItem.scss";
import LoadingSpinner from "../../../LoadingSpinner";
import ContextListItem from "./ContextListItem";
import { translate } from '../../../../localization/AutoIntlProvider';
import EmptyListItem from './EmptyListItem';

type State = {
    isLoading: boolean
    title: string
    favorites: Favorite[]
}

type Props = {
    reverse?: boolean
    onClose?:(e:React.MouseEvent) => void
}

export default class SideBarFavoritesContent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            isLoading: false,
            favorites: [],
            title: translate('Starred')
        }
    }

    componentDidMount = () => {
        this.getFavorites();
    }

    shouldComponentUpdate = (nextProps: Props, nextState:State) => {
        const loading = this.state.isLoading != nextState.isLoading
        return loading
    }

    getFavorites = () => {
        this.setState({isLoading: true})
        ApiClient.getFavorites((data, status, error) => {
            if (data && data.results) {
                this.setState({favorites: data.results, isLoading:false});
            }
        })
    }

    render = () => {
        var favorites = this.state.favorites.sort((a, b) => a.index - b.index)
        if (this.props.reverse)
            favorites = favorites.reverse()
        return (<>
            <div className="sidebar-content-header">
                <div className="sidebar-title">
                        {this.state.title}
                    </div>
                </div>
            <div className="sidebar-content-list">
                <div className="content d-flex">
                    <div className="items scrollbar flex-shrink-1">
                        { this.state.isLoading &&
                            <LoadingSpinner/>
                            ||
                            favorites.map((favorite) => {
                                if (favorite) {
                                    var object = favorite.object
                                    object.id = favorite.object_id
                                    object['avatar_thumbnail'] = favorite.image
                                    return <ContextListItem onClick={this.props.onClose} key={"favorite-" + favorite.id} type={favorite.object_natural_key} contextObject={object}/>
                                }
                            }
                        )}
                        { !this.state.isLoading && favorites.length == 0 &&
                            <EmptyListItem/>
                        }
                    </div>
                </div>
            </div>
        </>)
    }
}
