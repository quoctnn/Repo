import * as React from "react";
import "./SideMenuNavigation.scss"
import { ReduxState } from "../../redux";
import { RouteComponentProps, withRouter } from "react-router";
import { connect } from "react-redux";
import classnames from 'classnames';
import Logo from "../general/images/Logo";
import { translate } from "../../localization/AutoIntlProvider";
import CollapseComponent from "../general/CollapseComponent";
import { GroupSorting, Group, Project, ProjectSorting, ContextNaturalKey, Favorite, DraggableType, Community, UserProfile } from '../../types/intrasocial_types';
import ApiClient from "../../network/ApiClient";
import LogoSmall from "../general/images/LogoSmall";
import { IntraSocialLink } from "../general/IntraSocialLink";
import { SecureImage } from "../general/SecureImage";
import { useDrag } from 'react-dnd'
import ToggleSwitch from "../general/ToggleSwitch";
import Routes from '../../utilities/Routes';
import { Link } from "react-router-dom";
import { ContextManager } from "../../managers/ContextManager";
import { AuthenticationManager } from '../../managers/AuthenticationManager';

type ContextItemProps = {
    name?:string
    contextObject: any
    contextNaturalKey: ContextNaturalKey
    onClick?:(e:React.SyntheticEvent) => void
    image?:string
    draggableType?:DraggableType
    draggableId?:number
}
const ContextListItem = (props:ContextItemProps ) => {
    const getName = () => {
        return ContextNaturalKey.nameForContextObject(props.contextNaturalKey, props.contextObject)
    }
    const [{ isDragging }, drag] = !props.draggableType ? [{isDragging:false}, undefined] : useDrag({
        item: { id:props.draggableId, type:props.draggableType },
        end: (dropResult?: { name: string }) => {
          if (dropResult) {
            alert(`You dropped ${name} into ${dropResult.name}!`)
          }
        },
        collect: monitor => ({
          isDragging: monitor.isDragging(),
        }),
    })
    const name = props.name || getName()
    return <div ref={drag}><IntraSocialLink name={name} onClick={props.onClick} to={props.contextObject} type={props.contextNaturalKey} className="menu-list-item">
        <div className="title text-truncate">{name}</div>
    </IntraSocialLink></div>
}
const ContextGridItem = (props: ContextItemProps) => {
    const getName = () => {
        return ContextNaturalKey.nameForContextObject(props.contextNaturalKey, props.contextObject)
    }
    const getCover = () => {
        return ContextNaturalKey.coverForContextObject(props.contextNaturalKey, props.contextObject, true)
    }
    const getIcon = () => {
        return ContextNaturalKey.iconClassForKey(props.contextNaturalKey)
    }
    const [{ isDragging }, drag] = !props.draggableType ? [{isDragging:false}, undefined] : useDrag({
        item: { id:props.draggableId, type:props.draggableType },
        end: (dropResult?: { name: string }) => {
          if (dropResult) {
            alert(`You dropped ${name} into ${dropResult.name}!`)
          }
        },
        collect: monitor => ({
          isDragging: monitor.isDragging(),
        }),
    })
    const name = props.name || getName()
    return <div ref={props.draggableType && drag}>
                <IntraSocialLink name={name} onClick={props.onClick} to={props.contextObject} type={props.contextNaturalKey} className="menu-grid-item">
                    <SecureImage className="cover img-responsive" url={props.image || getCover()}/>
                    <div className="footer" >
                        <div className="title text-truncate">{name}</div>
                    </div>
                    <div className="icon">
                        <i className={getIcon()}></i>
                    </div>
                </IntraSocialLink>
            </div>
}
type MenuBlockOwnProps = {
    open: boolean
    icon: string
    title: string
}
type MenuBlockDefaultProps = {
    animationDuration: number
    removeContentOnCollapsed: boolean
}
type MenuBlockProps = MenuBlockOwnProps & MenuBlockDefaultProps
type MenuBlockState = {
    open: boolean
    propOpen: boolean
}
class MenuBlock extends React.Component<MenuBlockProps, MenuBlockState>
{
    static defaultProps: MenuBlockDefaultProps = {
        animationDuration: 250,
        removeContentOnCollapsed: false
    }
    constructor(props: MenuBlockProps) {
        super(props)
        this.state = {
            open: props.open,
            propOpen: props.open
        }
    }
    static getDerivedStateFromProps = (props: MenuBlockProps, state: MenuBlockState): MenuBlockState => {
        if (props.open != state.propOpen) {
            return { open: props.open, propOpen: props.open }
        }
        return null
    }
    toggle = () => {
        this.setState((prevState: MenuBlockState) => {
            return { open: !prevState.open }
        })
    }
    render() {
        const open = this.state.open
        const cn = classnames("menu-block d-flex", { active: open })
        return <div className={cn}>
            <div className="menu-block-side menu-button" style={{ transitionDuration: this.props.animationDuration + "ms" }}>
                <i className={this.props.icon}></i>
            </div>
            <div className="menu-block-content">
                <div className="menu-block-header" onClick={this.toggle} >
                    <div className="title text-truncate">{this.props.title}</div>
                </div>
                <CollapseComponent removeContentOnCollapsed={this.props.removeContentOnCollapsed} animationDuration={this.props.animationDuration} className="content" visible={open}>
                    {this.props.children}
                </CollapseComponent>
            </div>
        </div>
    }
}
enum MenuViewMode {
    list = "mode-list", grid = "mode-grid"
}

type FavoritesOwnProps = {
    mode: MenuViewMode
    onItemSelected:() => void
}
type FavoriteReduxStateProps = {
    favorites:Favorite[]
}
type FavoritesProps = FavoritesOwnProps & FavoriteReduxStateProps
type FavoritesState = {
}
class Favorites extends React.Component<FavoritesProps, FavoritesState> {
    constructor(props: FavoritesProps) {
        super(props)
        this.state = {
        }
    }
    renderItems = () => {
        if(this.props.mode == MenuViewMode.grid)
            return this.props.favorites.map(g => <ContextGridItem draggableId={g.id} draggableType={DraggableType.favorite}  name={g.object.name} image={g.image} onClick={this.props.onItemSelected} contextNaturalKey={g.object_natural_key} contextObject={g.object} key={"favorite_" + g.id} />)
        return this.props.favorites.map(g => <ContextListItem draggableId={g.id} draggableType={DraggableType.favorite} name={g.object.name} onClick={this.props.onItemSelected} contextNaturalKey={g.object_natural_key} contextObject={g.object} key={"favorite_" + g.id} />)
    }
    render = () => {
        return <>
                {this.renderItems()}
                <div className="spacer flex-grow-1 flex-shrink-1"></div>
                </>
    }
}
const favoritesMapStateToProps = (state: ReduxState, ownProps: FavoritesOwnProps): FavoriteReduxStateProps => {
    const all = state.favoriteStore.allIds
    const favorites = all.map(id => state.favoriteStore.byId[id])
    return {
        favorites
    }
}
const FavoritesConnected = connect<FavoriteReduxStateProps, {}, FavoritesOwnProps>(favoritesMapStateToProps, null)(Favorites)

type TopGroupsOwnProps = {
    mode: MenuViewMode
    onItemSelected:() => void
}
type TopGroupsProps = TopGroupsOwnProps & RouteComponentProps<any>
type TopGroupsState = {
    list: Group[]
}
class TopGroups extends React.Component<TopGroupsProps, TopGroupsState> {
    constructor(props: TopGroupsProps) {
        super(props)
        this.state = {
            list: []
        }
    }
    componentDidMount = () => {
        this.fetchGroups()
    }
    componentDidUpdate = (prevProps:TopGroupsProps) => {
        if (this.props.location.pathname != prevProps.location.pathname) {
            this.fetchGroups()
        }
    }
    fetchGroups = () => {
        ApiClient.getGroups(null, null, 6, 0, GroupSorting.mostUsed, (data, status, error) => {
            const list = (data && data.results) || []
            this.setState((prevState: TopGroupsState) => {
                return { list }
            })
        })
    }
    renderItems = () => {
        if(this.props.mode == MenuViewMode.grid)
            return this.state.list.map(g => <ContextGridItem draggableId={g.id} draggableType={DraggableType.group} onClick={this.props.onItemSelected} contextNaturalKey={ContextNaturalKey.GROUP} contextObject={g} key={"group_" + g.id} />)
        return this.state.list.map(g => <ContextListItem draggableId={g.id} draggableType={DraggableType.group} onClick={this.props.onItemSelected} contextNaturalKey={ContextNaturalKey.GROUP} contextObject={g} key={"group_" + g.id} />)
    }
    render = () => {
        return <>
                {this.renderItems()}
                <div className="spacer flex-grow-1 flex-shrink-1"></div>
                </>
    }
}
const ConnectedTopGroups = withRouter(TopGroups)
type TopProjectsOwnProps = {

    mode: MenuViewMode
    onItemSelected:() => void
}
type TopProjectsProps = TopProjectsOwnProps & RouteComponentProps<any>
type TopProjectsState = {
    list: Project[]
}
class TopProjects extends React.Component<TopProjectsProps, TopProjectsState> {
    constructor(props: TopProjectsProps) {
        super(props)
        this.state = {
            list: []
        }
    }
    componentDidMount = () => {
        this.fetchProjects()
    }
    componentDidUpdate = (prevProps:TopProjectsProps) => {
        if (this.props.location.pathname != prevProps.location.pathname) {
            this.fetchProjects()
        }
    }
    fetchProjects = () => {
        ApiClient.getProjects(null, 6, 0, ProjectSorting.mostUsed, null, null, (data, status, error) => {
            const list = (data && data.results) || []
            this.setState((prevState: TopProjectsState) => {
                return { list }
            })
        })
    }
    renderItems = () => {
        if(this.props.mode == MenuViewMode.grid)
            return this.state.list.map(g => <ContextGridItem onClick={this.props.onItemSelected} contextNaturalKey={ContextNaturalKey.PROJECT} contextObject={g} key={"project_" + g.id} />)
        return this.state.list.map(g => <ContextListItem onClick={this.props.onItemSelected} contextNaturalKey={ContextNaturalKey.PROJECT} contextObject={g} key={"project_" + g.id} />)
    }
    render = () => {
        return <>
                {this.renderItems()}
                <div className="spacer flex-grow-1 flex-shrink-1"></div>
                </>
    }
}
const ConnectedTopProjects = withRouter(TopProjects)

type OwnProps = {
}
type ReduxStateProps = {
    community:Community
    profile:UserProfile
}
type Props = OwnProps & ReduxStateProps

type State = {
    open: boolean
    mode: MenuViewMode
    closeMenuOnNavigation:boolean
}
class SideMenuNavigation extends React.Component<Props, State> {
    static bodyClass = "has-side-menu"
    static sideMenuLockedClass = "side-menu-locked"
    static animationDuration = 300
    private contentRef = React.createRef<HTMLDivElement>()
    constructor(props: Props) {
        super(props)
        this.state = {
            open: false,
            mode: MenuViewMode.grid,
            closeMenuOnNavigation:true,
        }
        document.body.classList.add(SideMenuNavigation.bodyClass)
    }
    outsideTrigger = (e:MouseEvent) => {
        if(this.isDialogVisible())
            return
        if(!this.contentRef.current.contains(e.target as any))
            this.toggleMenu()
    }
    componentDidUpdate = (prevProps:Props, prevState:State) => {
        const closeBehaviourChanged = prevState.closeMenuOnNavigation != this.state.closeMenuOnNavigation
        const openStateChanged = prevState.open != this.state.open
        if(openStateChanged || closeBehaviourChanged)
        {
            if(this.state.open && this.state.closeMenuOnNavigation)
                document.addEventListener('mousedown', this.outsideTrigger)
            else
                document.removeEventListener('mousedown', this.outsideTrigger)
        }
        if(closeBehaviourChanged)
        {
            if(this.state.closeMenuOnNavigation)
                document.body.classList.remove(SideMenuNavigation.sideMenuLockedClass)
            else
                document.body.classList.add(SideMenuNavigation.sideMenuLockedClass)
        }
    }
    componentWillUnmount = () => {
        document.body.classList.remove(SideMenuNavigation.bodyClass)
        document.body.classList.remove(SideMenuNavigation.sideMenuLockedClass)
        document.removeEventListener('mousedown', this.outsideTrigger);
    }
    toggleMenu = () => {
        this.setState((prevState: State) => {
            return { open: !prevState.open }
        })
    }
    closeOnNavigation = () => {
        this.setState((prevState: State) => {
            return { open: !prevState.open, closeMenuOnNavigation:true }
        })
    }
    toggleMode = () => {
        this.setState((prevState: State) => {
            const mode = prevState.mode == MenuViewMode.grid ? MenuViewMode.list : MenuViewMode.grid
            return { mode }
        })
    }
    renderHeader = () => {
        return <div className="menu-header d-flex" >
            {this.state.open &&
                <Logo className="intrawork-logo" progress={0} />
                ||
                <LogoSmall className="intrawork-logo-small" />
            }
            <div className="spacer flex-grow-1 flex-shrink-1"></div>
            {this.state.open && <div className="main-border-color-background ml-2" style={{ width: 1, height: "75%" }}></div>}
        </div>
    }
    handleLinkItemSelected = () => {
        if(this.state.closeMenuOnNavigation)
            this.toggleMenu()
    }
    handleToggleStateChange = (active:boolean) => {
        this.setState((prevState: State) => {
            return { closeMenuOnNavigation:!active }
        })
    }
    isDialogVisible = () => {
        return document.body.classList.contains("modal-open")
    }
    render() {
        const openMenu = !this.state.open ? this.toggleMenu : undefined
        const closeMenu = this.state.open ? this.closeOnNavigation : undefined
        const mode = this.state.mode
        const cn = classnames("main-content-background drop-shadow", mode,  { active: this.state.open })
        const modeIcon = mode == MenuViewMode.list ? "fas fa-th-large" : "fas fa-th-list"
        const modeIconClass = classnames("anim-icon-button", modeIcon)
        const borderHeight = this.state.open ? 1 : 0
        const transDur = SideMenuNavigation.animationDuration + "ms"
        const chapters = this.props.community && this.props.community.chapters
        const anonUser = this.props.profile.is_anonymous
        const noProjects = chapters || anonUser
        return (
            <div ref={this.contentRef} onClick={openMenu} id="side-menu-navigation" className={cn} style={{ transitionDuration: transDur }}>
                {this.renderHeader()}
                <div className="hbar main-border-color-background align-self-center" style={{ height: borderHeight, width: "90%", transitionDuration: transDur}}></div>
                <div className="menu-toolbar d-flex" style={{ transitionDuration: transDur }}>
                        <Link to={{pathname:Routes.CHANGELOG, state:{modal:true}}} className="menu-button">
                            <i className="fas fa-info-circle"></i>
                        </Link>
                        { anonUser || <>
                            <Link to={Routes.DEVELOPER_TOOL.path} className="menu-button">
                                <i className="fas fa-cog"></i>
                            </Link>
                            <Link to={Routes.FILES} className="menu-button">
                                <i className="fas fa-cloud"></i>
                            </Link>
                        </> }
                        <div className="menu-button mode-switch" onClick={this.toggleMode} style={{ transitionDuration: transDur }}>
                            <i className={modeIconClass}></i>
                        </div>
                </div>
                <div className="hbar main-border-color-background align-self-center" style={{ height: borderHeight, width: "90%" , transitionDuration: transDur}}></div>
                <div className="menu-content vertical-scroll">
                    { anonUser || <>
                        <MenuBlock animationDuration={SideMenuNavigation.animationDuration} open={this.state.open} icon="fas fa-star" title={translate("menu.favorites")}>
                            <FavoritesConnected onItemSelected={this.handleLinkItemSelected} mode={mode} />
                        </MenuBlock>
                        <div className="hbar main-border-color-background align-self-center" style={{ height: borderHeight, width: "90%" , transitionDuration: transDur}}></div>
                    </>}
                    { chapters &&
                        <MenuBlock removeContentOnCollapsed={false} animationDuration={SideMenuNavigation.animationDuration} open={this.state.open} icon="fas fa-users" title={translate("Chapters")}>
                        </MenuBlock>
                    }
                    <MenuBlock removeContentOnCollapsed={false} animationDuration={SideMenuNavigation.animationDuration} open={this.state.open} icon="fas fa-users" title={translate("Groups")}>
                        <ConnectedTopGroups onItemSelected={this.handleLinkItemSelected} mode={mode} />
                    </MenuBlock>
                    { noProjects || <>
                        <div className="hbar main-border-color-background align-self-center" style={{ height: borderHeight, width: "90%" , transitionDuration: transDur}}></div>
                        <MenuBlock removeContentOnCollapsed={false} animationDuration={SideMenuNavigation.animationDuration} open={this.state.open} icon="fas fa-clipboard-list" title={translate("Projects")}>
                            <ConnectedTopProjects onItemSelected={this.handleLinkItemSelected} mode={mode} />
                        </MenuBlock>
                    </>}
                </div>
                    <div className="spacer flex-grow-1 flex-shrink-1"></div>
                    <div className="footer menu-bottom d-flex">
                        {this.state.open && <div className="d-flex flex-grow-1">
                            <ToggleSwitch active={!this.state.closeMenuOnNavigation} onStateChanged={this.handleToggleStateChange} />
                            <span className="mr-1 text-truncate">{translate("always visible")}</span>
                        </div>
                        }
                        <div className="menu-toggle flex-shrink-1" onClick={closeMenu} >
                            <i className="anim-icon-button fas fa-chevron-right" style={{ transitionDuration: SideMenuNavigation.animationDuration + "ms" }}></i>
                        </div>
                    </div>
            </div>
        );
    }
}

const mapStateToProps = (state: ReduxState, ownProps: OwnProps & RouteComponentProps<any>): ReduxStateProps => {

    const community = ContextManager.getContextObject(ownProps.location.pathname, ContextNaturalKey.COMMUNITY) as Community
    const profile = AuthenticationManager.getAuthenticatedUser()
    return {
        community,
        profile
    }
}
export default withRouter(connect(mapStateToProps, null)(SideMenuNavigation))
