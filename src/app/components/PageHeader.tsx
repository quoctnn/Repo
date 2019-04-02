import * as React from "react";
import "./PageHeader.scss"
import { ReduxState } from "../redux";
import { Community } from "../types/intrasocial_types";
import { connect } from "react-redux";
import { CoverImage } from "./general/CoverImage";
import classnames = require("classnames");
import PageTopNavigation from "./PageTopNavigation";

interface OwnProps
{
    coverImage:string
    primaryItemImage:string 
    primaryItemTitle:string
}
type Props = OwnProps

export default class PageHeader extends React.Component<Props, {}> {
    render() {
        const { coverImage } = this.props
        const cn = classnames({"no-image": !coverImage}, {"fallback": coverImage});
        return(
            <div id="page-header" className={cn}>
                <CoverImage id="page-header-cover-image" src={coverImage}>
                </CoverImage>
                <PageTopNavigation primaryItemImage={this.props.primaryItemImage} primaryItemTitle={this.props.primaryItemTitle} />
                <div className="circle"></div>
            </div>
        );
    }
}