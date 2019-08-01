import * as React from "react";
import { Avatar } from '../../components/general/Avatar';
import classnames = require("classnames");

type Props = {
    className?:string
    avatar?:string
    title:React.ReactNode
    description?:React.ReactNode
}
type State = {

}
export default class CVListItem extends React.PureComponent<Props, State> {

    constructor(props:Props) {
        super(props)
        this.state = {
        }
    }
    render = () => 
    {
        const {avatar, className, title, description} = this.props
        const cn = classnames("cv-list-item d-flex", className)
        return <div className={cn}>
                    {avatar && <Avatar image={avatar} size={40}/>}
                    <div className="d-flex flex-column justify-content-center">
                        <div className="primary-text">{title}</div>
                        {description && 
                            <div className="secondary-text medium-small-text">
                            {description}
                            </div>
                        }
                    </div>
                </div>
    }
}