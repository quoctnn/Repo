import { EndpointManager } from "../managers/EndpointManager";

const resolveAbsolute = (relative:string) => {
    return () => {
        return EndpointManager.applyEndpointDomain(relative)
    }
}
export default  {
    apiRoute: {
        login:"/api/v1/auth/oup/login/",
        nativeLogin:"/api/v1/auth-oup/native-login/",
        socialLogin:"/api/v1/auth-oup/social-login/",
        gdprForm:"/api/v1/auth-oup/gdpr-form/",

        //calendar
        calendarItemDetailUrl: (id:number) => {
            return `/api/v2/calendar/${id}/`
        },
        calendarUrl:"/api/v2/calendar/",

        // Version
        versionUrl:"/api/v2/version/basic/",
        // Purchases
        invoiceListUrl: '/api/v1/invoice/',
        getInvoiceItem: (id:number) => {
            return `/api/v1/invoice/${id}/`
        },
        orderListUrl: '/api/v1/order/',
        getOrderItem: (id:number) => {
            return `/api/v1/order/${id}/`
        },
        subscriptionListUrl: '/api/v1/subscription/',
        getSubscriptionItem: (id:number) => {
            return `/api/v1/subscription/${id}/`
        },
        //Dashboards
        dashboardListEndpoint: "/api/v2/dashboard/",
        getDashboardItem: (id:number) => {
            return `/api/v2/dashboard/${id}/`
        },

        // Embedly Cache
        embedlyApiEndpoint: "/api/v2/embedly/",

        //embed card
        parseUrl:'/api/v1/links/parse-url/',
        //search
        searchUrl: '/api/v1/search/',
        getSearchHistoryUrl: '/api/v1/search/history/',//GET
        createSearchHistoryUrl: '/api/v1/search/history/', //POST
        removeSearchHistoryUrl: (id:number) => {
            return `/api/v1/search/${id}/remove_from_history/`
        },
        communityRolesBatchUrl:"/api/v2/community-roles/batch/",
        communityRolesUrl:"/api/v2/community-roles/",
        communityRoleUrl: (id:number) => {
            return `/api/v2/community-roles/${id}/`
        },
        // Community URLs
        myCommunitiesUrl: '/api/v2/community/as-member/',
        invitedCommunitiesUrl: '/api/v2/community/invitations/',
        communityMembersUrl: (id:number) => {
            return `/api/v2/community/${id}/members/`
        },
        communityMembersKickUrl: (id:number) => {
            return `/api/v2/community/${id}/kick/`
        },
        communityFilesUrl: (id:number|string) => {
            return `/api/v1/community/${id}/files/`
        },
        communityUrl: (id:number|string) => {
            return `/api/v2/community/${id}/`
        },
        communityConfigurationUrl: (id:number|string) => {
            return `/api/v2/community/${id}/configuration/`
        },
        communityAvatarUrl: (id:number) => {
            return `/api/v2/community/${id}/avatar/`
        },
        communityAdminUrl: (id:number) => {
            return `/api/v2/community/${id}/admin/`
        },
        communityCoverUrl: (id:number) => {
            return `/api/v2/community/${id}/cover/`
        },
        setMainCommunityUrl: (id:number|string) => {
            return `/api/v2/community/${id}/set-as-main`
        },
        communityInvitationDeleteUrl: (id:number) => {
            return `/api/v2/community-invitation/${id}/`
        },
        communityInvitationAcceptUrl: (id:number) => {
            return `/api/v2/community-invitation/${id}/accept/`
        },
        communityInvitationUrl:"/api/v2/community-invitation/",
        communityInvitationBatchUrl:"/api/v2/community-invitation/batch/",
        communityMembershipRequestDeleteUrl: (id:number) => {
            return `/api/v2/community-memberrequest/${id}/`
        },
        communityMembershipRequestAcceptUrl: (id:number) => {
            return `/api/v2/community-memberrequest/${id}/accept/`
        },
        communityList:'/api/v2/community/',
        // Profile URLs
        myProfileUrl: '/api/v2/profile/me/',
        profileUrl: (id:string|number) => {
            return `/api/v2/profile/${id}/`
        },
        profileAvatarUrl: (id:string|number) => {
            return `/api/v2/profile/${id}/avatar/`
        },
        profileCoverUrl: (id:string|number) => {
            return `/api/v2/profile/${id}/cover/`
        },
        profilesUrl: '/api/v2/profile/',
        profilesV1Url: '/api/v1/profile/',

        myBusinessDataUrl:"/api/v2/profile/business-data/",
        myPersonalDataUrl:"/api/v2/profile/personal-data/",

        // Friends URLs
        friendsUrl: '/api/v2/friends/',
        friendsDelete: (id:number) => {
            return `/api/v2/friends/${id}/`
        },
        friendInvitation: '/api/v2/friend-invitation/',
        friendInvitationDelete: (id:number) => {
            return `/api/v2/friend-invitation/${id}/`
        },
        friendInvitationAccept: (id:number) => {
            return `/api/v2/friend-invitation/${id}/accept/`
        },

        // Blocking URLs
        blockUrl: '/api/v2/blocking/',
        blockDelete: (id:number) => {
            return `/api/v2/blocking/${id}/`
        },

        // Group URLs
        groupUrl: (id:number|string) => {
            return `/api/v2/group/${id}/`
        },
        groupsUrl: '/api/v2/group/',
        myGroupsUrl: '/api/v2/group/as-member/',
        groupFilesUrl: (id:number) => {
            return `/api/v2/group/${id}/files/`
        },
        groupInvitationListUrl: "/api/v2/group-invitation/",
        groupInvitationBatchUrl:"/api/v2/group-invitation/batch/",
        groupInvitationDeleteUrl: (id:number) => {
            return `/api/v2/group-invitation/${id}/`
        },
        groupMembersUrl: (id:number) => {
            return `/api/v2/group/${id}/members/`
        },
        groupMembersKickUrl: (id:number) => {
            return `/api/v2/group/${id}/kick/`
        },
        groupRolesUrl: (id:number) => {
            return `/api/v2/group/${id}/roles/`
        },
        groupModerateUrl: (id:number) => {
            return `/api/v2/group/${id}/moderate/`
        },
        groupInvitationAcceptUrl: (id:number) => {
            return `/api/v2/group-invitation/${id}/accept/`
        },
        groupMembershipRequestDeleteUrl: (id:number) => {
            return `/api/v2/group-memberrequest/${id}/`
        },
        groupMembershipRequestAcceptUrl: (id:number) => {
            return `/api/v2/group-memberrequest/${id}/accept/`
        },
        groupReviewUrl: "/api/v2/group/under-review/",
        groupAvatarUrl: (id:number) => {
            return `/api/v2/group/${id}/avatar/`
        },
        groupCoverUrl: (id:number) => {
            return `/api/v2/group/${id}/cover/`
        },
        // Project URLs
        projectMembersUrl: (id:number) => {
            return `/api/v2/project/${id}/members/`
        },
        projectMembershipUrl: (id:number) => {
            return `/api/v2/project/${id}/membership/`
        },
        projectMembersKickUrl: (id:number) => {
            return `/api/v2/project/${id}/kick/`
        },
        projectRolesUrl: (id:number) => {
            return `/api/v2/project/${id}/roles/`
        },
        projectModerateUrl: (id:number) => {
            return `/api/v2/project/${id}/moderate/`
        },
        projectManagerUrl: (id:number) => {
            return `/api/v2/project/${id}/manager/`
        },
        projectsUrl: '/api/v2/project/',
        projectReviewUrl: "/api/v2/project/under-review/",
        projectDetailUrl: (id:number|string) => {
            return `/api/v2/project/${id}/`
        },
        projectAvatarUrl: (id:string|number) => {
            return `/api/v2/project/${id}/avatar/`
        },
        projectCoverUrl: (id:string|number) => {
            return `/api/v2/project/${id}/cover/`
        },
        //Task
        taskUrl: '/api/v2/task/',
        taskIdUrl: (id:number) => {
            return `/api/v2/task/${id}/`
        },
        taskMarkAsReadUrl: (id:number) => {
            return `/api/v2/task/${id}/mark-read/`
        },

        productsPlans: '/api/v1/products/plan/',
        productsSKU: '/api/v1/products/sku/',

        orderCoupon: '/api/v1/order/coupon/',
        orderUpdate: '/api/v1/order/order_update/',
        orderConfirm: '/api/v1/order/order_confirm/',
        orderPay: '/api/v1/order/pay_order/',

        addCardSource:'/api/v1/source/add/',
        getCardSource: (customerId:number) => {
            return `/api/v1/source/get/?id=${encodeURIComponent(customerId.toString())}`
        },
        projectTeamProfilesUrl: (id:number) => {
            return `/api/v2/project/${id}/team/`
        },
        projectTasksUrl: (id:number) => {
            return `/api/v2/project/${id}/tasks/`
        },
        taskSubTasksUrl: (id:number) => {
            return `/api/v2/task/${id}/subtasks/`
        },
        taskDetailUrl: (id:number) => {
            return `/api/v2/task/${id}/`
        },
        projectFilesUrl: (id:number) => {
            return `/api/v2/project/${id}/files/`
        },
        timeSheetUrl: '/api/v2/timesheet/',
        timeSheetDetailUrl: (id:number) => {
            return `/api/v2/timesheet/${id}/`
        },
        timeSheetRemoveUrl: (id:number) => {
            return `/api/v2/timesheet/${id}/`
        },

        // Event URLs
        upcomingEventsUrl: '/api/v2/event/upcoming/',
        eventModerateUrl: (id:number) => {
            return `/api/v2/event/${id}/moderate/`
        },
        eventMembersUrl: (id:number) => {
            return `/api/v2/event/${id}/members/`
        },
        eventMembersKickUrl: (id:number) => {
            return `/api/v2/event/${id}/kick/`
        },
        eventAvatarUrl: (id:number) => {
            return `/api/v2/event/${id}/avatar/`
        },
        eventCoverUrl: (id:number) => {
            return `/api/v2/event/${id}/cover/`
        },
        eventsUrl: '/api/v2/event/',
        eventReviewUrl: "/api/v2/event/under-review/",
        eventDetailUrl: (id:number|string) => {
            return `/api/v2/event/${id}/`
        },
        eventFilesUrl: (id:number) => {
            return `/api/v2/event/${id}/files/`
        },
        eventInvitationGoingUrl: (id:number) => {
            return `/api/v2/event-invitation/${id}/attending/`
        },
        eventInvitationNotGoingUrl: (id:number) => {
            return `/api/v2/event-invitation/${id}/not-attending/`
        },
        eventInvitationDeleteUrl: (id:number) => {
            return `/api/v2/event-invitation/${id}/`
        },
        eventInvitationBatchUrl:"/api/v2/event-invitation/batch/",
        eventInvitationListUrl: "/api/v2/event-invitation/",
        eventMembershipRequestDeleteUrl: (id:number) => {
            return `/api/v2/event-memberrequest/${id}/`
        },
        eventMembershipRequestAcceptUrl: (id:number) => {
            return `/api/v2/event-memberrequest/${id}/accept/`
        },
        // Recent Activity URLs
        recentActivityUrl: '/api/v2/notification/',
        recentActivityUnreadUrl: '/api/v2/notification/unread-count/',
        recentActivityMarkAllReadUrl: '/api/v2/notification/mark-all-as-read/',
        notificationsMarkActionsReadUrl: '/api/v2/notification/mark-actions-as-read/',

        // Notification URLs
        notificationUrl: '/api/v2/notification/',
        notificationLastActivityTimeUrl: '/api/v2/notification/last-activity-time/',
        notificationUnreadUrl: '/api/v2/notification/unread-count/',
        notificationMarkReadUrl: '/api/v2/notification/update-as-read/',
        notificationMarkSeenUrl: '/api/v2/notification/update-as-seen/',
        notificationMarkAllReadUrl: '/api/v2/notification/mark-all-as-read/',
        notificationsUnhandledUrl:'/api/v2/notification/unhandled/',

        newsfeed:'/api/v2/newsfeed/',
        // Conversation Notification URLs
        convNotificationUrl: '/api/v2/notification_conv/',
        convNotificationLastActivityTimeUrl: '/api/v2/notification_conv/last-activity-time/',
        convNotificationUnreadUrl: '/api/v2/notification_conv/unread-count/',
        convNotificationMarkReadUrl: '/api/v2/notification_conv/update-as-read/',
        convNotificationMarkAllReadUrl: '/api/v2/notification_conv/mark-all-as-read/',

        //Status attributes
        statusAttributes:'/api/v2/status-attributes/',
        statusAttributesId: (id:number) => {
            return `/api/v2/status-attributes/${id}/`
        },
        //Task attributes
        taskAttributes:'/api/v2/task-attributes/',
        taskAttributesId: (id:number) => {
            return `/api/v2/task-attributes/${id}/`
        },
        // Status
        statusMarkRead:"/api/v2/status/mark-read/",
        statusSingle: (id:number) => {
            return `/api/v2/status/${id}/single/`
        },
        postUrl: '/api/v2/status/',
        postCommentsUrl: (id:number) => {
            return `/api/v2/status/${id}/children/`
        },
        postUpdateUrl: (id:number|string) => {
            return `/api/v2/status/${id}/`
        },
        postLike: (id:number) => {
            return `/api/v1/status/${id}/like/`
        },
        postReaction: (id:number) => {
            return `/api/v2/status/${id}/react/`
        },
        //File
        fileUploadUrl: '/api/v2/file-upload/',
        fileUploadUpdateName: (id:number) => {
            return `/api/v2/file-upload/${id}/update-name/`
        },
        //message
        messageMarkRead:"/api/v2/message/mark-read/",
        //conversation
        conversationMessagesUrl: "/api/v2/message/",
        conversationMarkAsReadUrl: (id:number) => {
            return `/api/v2/conversation/${id}/mark-read/`
        },
        conversation: (id:number) => {
            return `/api/v2/conversation/${id}/`
        },
        archiveConversation: (id:number) => {
            return `/api/v2/conversation/${id}/archive/`
        },
        leaveConversation: (id:number) => {
            return `/api/v2/conversation/${id}/leave/`
        },
        addConversationUsers: (id:number) => {
            return `/api/v2/conversation/${id}/add-users/`
        },
        removeConversationUsers: (id:number) => {
            return `/api/v2/conversation/${id}/kick/`
        },
        conversations: '/api/v2/conversation/',
        composeMessageUrl: '/api/v1/conversation/compose/',

        //report
        reportUrl: (context_type:string, context_object_id:number) => {
            return `/api/v2/${context_type}/${context_object_id}/report/`
        },
        reportTags:'/api/v2/report/tags/',
        //favorites
        favoritesUrl:"/api/v2/favorites/",
        updateFavoriteUrl: (id:number) => {
            return `/api/v2/favorites/${id}/`
        },

        // CV URLs
        languageUrl:"/api/v2/cv/language/",
        certificationUrl:"/api/v2/cv/certification/",
        educationUrl:"/api/v2/cv/education/",
        positionUrl:"/api/v2/cv/position/",
        volunteeringUrl:"/api/v2/cv/volunteering/",

        //
        createCrashReportUrl:"/api/v2/crash-report/new/"
    },

    urlsRoute: {
        login:"/accounts/login/",
        profileList: '/profiles/',
        myProfile: '/profile/me/',
        myGroups: '/group/member/',
        myEvents: '/event/list/',
        myProjects: '/project/',
        projectPurchaseUrl: "/project/add/template/purchase/",
        newsfeed: '/newsfeed/',
        projectDetailUrl: (id:number, name:string) => {
            return `/project/${id}/${name}`
        },
        filesGrid: '/files/grid/',
        filesContentObjectGrid: (model:string, id:number) => {
            return `/files/grid/?content_type=${model}&object_id=${id}`
        },
        openUploadedFile: (id:number) => {
            return `/files/open/uploaded-file/${id}/`
        },
        downloadUploadedFile: (id:number) => {
            return `/files/download/uploaded-file/${id}/`
        },
        statusPermalink: (id:number) => {
            return `/status/${id}/`
        },
        notificationsConfig: "/notification/config/",
        notificationsAll: "/notification/",
        searchWithTags: (tag:string) => {
            return `/search/?term=${encodeURIComponent(tag)}`
        },
    },

    defaultImg: {
        docs: "/static/img/docs_logo.png",
        sendDark:"/static/img/icon-send-dark.png",
        user: '/static/img/default-widget.jpg',
        userAvatar: '/static/img/default-user.png',
        group: '/static/img/default-widget.jpg',
        groupAvatar: '/static/img/default-group.jpg',
        community: '/static/img/default-widget.jpg',
        communityAvatar: '/static/img/default-group.jpg',
        event: '/static/img/default-widget.jpg',
        eventAvatar: '/static/img/default-group.jpg',
        project: '/static/img/default-widget.jpg',
        projectAvatar: '/static/img/default-group.jpg',
        default: '/static/img/og_image.jpg'
    },
    docs:{
        changelog:"/app/assets/docs/CHANGELOG.rst"
    },
    resolveUrl:resolveAbsolute
};
