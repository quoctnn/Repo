import { EndpointManager } from './EndpointManager';
import { AuthenticationManager } from './AuthenticationManager';
import { EventStreamManager } from './EventStreamManager';
import { CommunityManager } from './CommunityManager';
import { ProfileManager } from './ProfileManager';
import { ToastManager } from './ToastManager';
import { ContextManager } from './ContextManager';
import { PermissionManager } from './PermissionManager';
import { ApplicationManager } from './ApplicationManager';
import { WindowAppManager } from './WindowAppManager';
import { ThemeManager } from './ThemeManager';
import { ConversationManager } from './ConversationManager';
import { NotificationManager } from './NotificationManager';
import { FavoriteManager } from './FavoriteManager';
const initializeManagers = () => 
{
    ApplicationManager.setup()
    EndpointManager.setup()
    AuthenticationManager.setup()
    EventStreamManager.setup()
    CommunityManager.setup()
    ProfileManager.setup()
    ToastManager.setup()
    ContextManager.setup()
    PermissionManager.setup()
    WindowAppManager.setup()
    ThemeManager.setup()
    ConversationManager.setup()
    NotificationManager.setup()
    FavoriteManager.setup()
}
export default initializeManagers