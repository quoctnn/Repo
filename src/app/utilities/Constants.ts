export default  {
    apiRoute: {
        login:"/api/v1/auth/oup/login/",
        nativeLogin:"/api/v1/auth-oup/native-login/",
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
        // Community URLs
        myCommunitiesUrl: '/api/v2/community/as-member/',
        invitedCommunitiesUrl: '/api/v2/community/invitations/',
        communityMembersUrl: (id:number) => {
            return `/api/v2/community/${id}/members/`
        },
        communityFilesUrl: (id:number) => {
            return `/api/v2/community/${id}/files/`
        },
        communityUrl: (id:number|string) => {
            return `/api/v2/community/${id}/`
        },
        communityList:'/api/v2/community/',
        // Profile URLs
        myProfileUrl: '/api/v2/profile/me/',
        profileUrl: (id:string|number) => {
            return `/api/v2/profile/${id}/`
        },
        profilesUrl: '/api/v2/profile/',

        myBusinessDataUrl:"/api/v2/profile/business_data/",
        myPersonalDataUrl:"/api/v2/profile/personal_data/",
        // Friends URLs
        friendsUrl: '/api/v2/friends/',
        acquaintancesUrl : '/api/v2/friends/acquaintances/',

        // Group URLs
        groupUrl: (id:number|string) => {
            return `/api/v2/group/${id}/`
        },
        groupsUrl: '/api/v2/group/',
        myGroupsUrl: '/api/v2/group/as-member/',
        groupFilesUrl: (id:number) => {
            return `/api/v2/group/${id}/files/`
        },

        // Project URLs
        projectsUrl: '/api/v2/project/',
        projectDetailUrl: (id:number|string) => {
            return `/api/v2/project/${id}/`
        },
        taskUrl: '/api/v2/task/',

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
        timeSheetUrl: '/api/v1/timesheet/',
        timeSheetDetailUrl: (id:number) => {
            return `/api/v1/timesheet/${id}/`
        },
        timeSheetRemoveUrl: (id:number) => {
            return `/api/v1/timesheet/${id}/`
        },

        // Event URLs
        upcomingEventsUrl: '/api/v1/event/upcoming/',
        eventsUrl: '/api/v1/event/',
        eventDetailUrl: (id:number|string) => {
            return `/api/v1/event/${id}/`
        },
        eventFilesUrl: (id:number) => {
            return `/api/v1/event/${id}/files/`
        },

        // Notification URLs
        notificationUrl: '/api/v2/notification/',
        notificationLastActivityTimeUrl: '/api/v2/notification/last-activity-time/',
        notificationUnreadUrl: '/api/v2/notification/unread-count/',
        notificationMarkReadUrl: '/api/v2/notification/update-as-read/',
        notificationMarkAllReadUrl: '/api/v2/notification/mark-all-as-read/',

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
        // Other
        postUrl: '/api/v2/status/',
        postCommentsUrl: (id:number) => {
            return `/api/v2/status/${id}/`
        },
        postUpdateUrl: (id:number) => {
            return `/api/v1/status/${id}/`
        },
        postLike: (id:number) => {
            return `/api/v1/status/${id}/like/`
        },
        postReaction: (id:number) => {
            return `/api/v2/status/${id}/react/`
        },
        fileUploadUrl: '/api/v1/file-upload/',
        conversationMessagesUrl: (id:number) => {
            return `/api/v2/conversation/${id}/messages/`
        },
        conversationMarkAsReadUrl: (id:number) => {
            return `/api/v2/conversation/${id}/mark_read/`
        },
        conversation: (id:number) => {
            return `/api/v2/conversation/${id}/`
        },
        conversations: '/api/v2/conversation/',
        composeMessageUrl: '/api/v1/conversation/compose/',

        //report
        reportUrl: (context_type:string, context_object_id:number) => {
            return `/api/v1/${context_type}/${context_object_id}/report/`
        },
        reportTags:'/api/v1/report/tags/',
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
        docs: "img/docs_logo.png",
        sendDark:"img/icon-send-dark.png",
        user: 'img/default-widget.jpg',
        userAvatar: 'img/default-user.png',
        group: 'img/default-widget.jpg',
        groupAvatar: 'img/default-group.jpg',
        community: 'img/default-widget.jpg',
        communityAvatar: 'img/default-group.jpg',
        event: 'img/default-widget.jpg',
        eventAvatar: 'img/default-group.jpg',
        default: 'img/og_image.jpg'
    },
    staticUrl:"/static/",
};
