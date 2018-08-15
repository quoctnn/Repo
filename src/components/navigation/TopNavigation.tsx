import { Routes } from '../../utilities/Routes';
import * as React from 'react';
import ProfileStatus from "../general/ProfileStatus";
import {Settings} from "../../utilities/Settings"
import { DevToolTrigger } from '../dev/DevToolTrigger';
import { Link} from 'react-router-dom'
require("./TopNavigation.scss");
export interface Props {
}

export default class TopNavigation extends React.Component<Props, {}> {
    render() {
        return(
            <div id="top-navigation" className="flex align-center">
                <div className=""><Link className="btn btn-primary margin-right-sm" to={Routes.ROOT}><i className="fas fa-home" /></Link></div>
                <div className="flex-grow flex-shrink"></div>
                <div className="flex">
                    {!Settings.isProduction && <DevToolTrigger /> }
                    <ProfileStatus />
                </div>
            </div>
        );
    }
}