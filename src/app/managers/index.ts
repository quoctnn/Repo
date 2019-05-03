import { EndpointManager } from './EndpointManager';
import { AuthenticationManager } from './AuthenticationManager';
import { EventStreamManager } from './EventStreamManager';
import { CommunityManager } from './CommunityManager';
import { ProfileManager } from './ProfileManager';
import { GroupManager } from './GroupManager';
import { ProjectManager } from './ProjectManager';
import { ToastManager } from './ToastManager';
import { EventManager } from './EventManager';
import { TaskManager } from './TaskManager';
import { ContextManager } from './ContextManager';
import { PermissionManager } from './PermissionManager';
import { ApplicationManager } from './ApplicationManager';
import { WindowAppManager } from './WindowAppManager';
import { ThemeManager } from './ThemeManager';
const initializeManagers = () => 
{
    ApplicationManager.setup()
    EndpointManager.setup()
    AuthenticationManager.setup()
    EventStreamManager.setup()
    CommunityManager.setup()
    ProfileManager.setup()
    GroupManager.setup()
    ProjectManager.setup()
    ToastManager.setup()
    EventManager.setup()
    TaskManager.setup()
    ContextManager.setup()
    PermissionManager.setup()
    WindowAppManager.setup()
    ThemeManager.setup()
}
export default initializeManagers