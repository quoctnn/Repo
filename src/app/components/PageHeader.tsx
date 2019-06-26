import * as React from "react";
import "./PageHeader.scss"
import { CoverImage } from "./general/CoverImage";
import classnames = require("classnames");
import PageMainNavigation from "./PageMainNavigation";
import PageTopMenu from "./PageTopMenu";
import Logo from "./general/images/Logo";
import TopNavigation from "./navigation/TopNavigation";
import SideMenuNavigation from "./navigation/SideMenuNavigation";

interface OwnProps
{
    coverImage:string
    primaryItemImage:string
    primaryItemTitle:string
}
type Props = OwnProps

export default class PageHeader extends React.Component<Props, {}> {
    render() {
        return null
        const { coverImage } = this.props
        const cn = classnames({"no-image": !coverImage}, {"fallback": coverImage});
        return(<div id="page-header" className={cn}>
                    <CoverImage id="page-header-cover-image" src={coverImage}>
                    </CoverImage>
                    <div className="page-top-navigation">
                        <Logo className="intrawork-logo" progress={0}/>
                        <div className="flex-grow-1"></div>
                        <PageTopMenu />
                    </div>
                    <PageMainNavigation primaryItemImage={this.props.primaryItemImage} primaryItemTitle={this.props.primaryItemTitle} />
                    <div className="circle"></div>
                </div>
        );
    }
}