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
import { Button } from 'reactstrap';
import { translate } from '../localization/AutoIntlProvider';
import SimpleDialog from '../components/general/dialogs/SimpleDialog';
import { ContextDataProps } from '../hoc/WithContextData';
type OwnProps = {
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
    style?: React.CSSProperties
    modalLinkTitle?:string
    renderModalContent?:() => JSX.Element
    moduleRef?:React.LegacyRef<HTMLDivElement>
}
type DefaultProps = {
    showHeader:boolean
    showHeaderTitle:boolean
}
type Props = OwnProps & DefaultProps
type State = {
    menuVisible:boolean
    modalVisible:boolean
}
export default class SimpleModule extends React.Component<Props, State> {
    static defaultProps:DefaultProps = {
        showHeader:true,
        showHeaderTitle:true
    }
    constructor(props:Props) {
        super(props);
        this.state = {
            menuVisible:false,
            modalVisible:false
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
    renderShowInModalButton = () => {
        if(!this.props.renderModalContent)
            return null
        return <div className="d-flex justify-content-center p-1"><Button color="link" onClick={this.toggleModal} size="xs">{this.props.modalLinkTitle || translate("common.see.all")}</Button></div>
    }
    toggleModal = () => {
        this.setState((prevState:State) => {
            return {modalVisible:!prevState.modalVisible}
        })
    }

    renderModal = () => {
        if(!this.props.renderModalContent)
            return
            
        return <SimpleDialog scrollable={true} className="module-modal has-module" header={this.props.headerTitle} visible={this.state.modalVisible} didCancel={this.toggleModal}>
                    {this.props.renderModalContent()}
                </SimpleDialog>
    }
    render()
    {
        const { breakpoint, className,children, menu, headerTitle: title, isLoading,  headerClick, headerContent, showHeader, style} = this.props
        const cn = classnames("simple-module", className, {"menu-visible":this.state.menuVisible})
        const headerTitle = this.props.showHeaderTitle && title
        const headClick = breakpoint < ResponsiveBreakpoint.standard ? headerClick : undefined
        const headerClass = classnames({link:headClick})
        return (<Module style={style} className={cn}>
                    { showHeader &&
                        <ModuleHeader className={headerClass} onClick={headClick} loading={isLoading} headerTitle={headerTitle}>
                            {headerContent}
                            {menu && <ModuleMenuTrigger onClick={this.toggleMenuClick} />}
                        </ModuleHeader>
                    }
                    <ModuleContent>
                        {children}
                        {this.renderShowInModalButton()}
                        {this.renderModal()}
                    </ModuleContent>
                    <ModuleMenu visible={this.state.menuVisible}>
                        {menu}
                    </ModuleMenu>
                </Module>)
    }
}