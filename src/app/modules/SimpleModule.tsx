import * as React from 'react';
import classnames from "classnames"
import "./SimpleModule.scss"
import { ResponsiveBreakpoint } from '../components/general/observers/ResponsiveComponent';
import { ContextNaturalKey } from '../types/intrasocial_types';
import Module from './Module';
import ModuleHeader from './ModuleHeader';
import ModuleMenuTrigger from './ModuleMenuTrigger';
import ModuleContent from './ModuleContent';
import ModuleMenu from './ModuleMenu';
type Props = {
    className?:string
    breakpoint:ResponsiveBreakpoint
    contextNaturalKey?:ContextNaturalKey
    menu?:JSX.Element
    children:JSX.Element | JSX.Element[]
    onMenuToggle?:(visible:boolean) => void
    headerTitle?:string | JSX.Element
    headerContent?: React.ReactNode
    headerClick?:(event:React.SyntheticEvent<any>) => void
    isLoading:boolean
}
type State = {
    menuVisible:boolean
}
export default class SimpleModule extends React.Component<Props, State> {  
    constructor(props:Props) {
        super(props);
        this.state = {
            menuVisible:false,
        }
    }
    toggleMenuClick = (e:React.SyntheticEvent<any>) => {
        e.preventDefault()
        e.stopPropagation()
        this.setState((prevState) => {
            return {menuVisible: !prevState.menuVisible}
        }, this.sendMenuToggled)
    }
    sendMenuToggled = () => {
        this.props.onMenuToggle && this.props.onMenuToggle(this.state.menuVisible)
    }
    render()
    {
        const {breakpoint, className, contextNaturalKey,children, menu, onMenuToggle: onMenuVisibilityChanged, headerTitle: title, isLoading,  headerClick, headerContent,  ...rest} = this.props
        const cn = classnames("simple-module", className, {"menu-visible":this.state.menuVisible})
        const headClick = breakpoint < ResponsiveBreakpoint.standard ? headerClick : undefined
        const headerClass = classnames({link:headClick})
        return (<Module {...rest} className={cn}>
                    <ModuleHeader className={headerClass} onClick={headClick} loading={isLoading} headerTitle={title}>
                        {headerContent}
                        {menu && <ModuleMenuTrigger onClick={this.toggleMenuClick} />}
                    </ModuleHeader>
                    {breakpoint >= ResponsiveBreakpoint.standard && //do not render for small screens
                        <>
                            <ModuleContent>
                                {children}
                            </ModuleContent>
                        </>
                    }
                    <ModuleMenu visible={this.state.menuVisible}>
                        {menu}
                    </ModuleMenu>
                </Module>)
    }
}