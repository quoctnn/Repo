export default  {
    apiRoute: {
        login:"/api/v1/auth/oup/login/",
        nativeLogin:"/api/v1/auth-oup/native-login/",
        // Purchases
        invoiceListUrl: '/api/v1/invoice/',
        getInvoiceItem: (id) => {
            return `/api/v1/invoice/${id}/`
        },
        orderListUrl: '/api/v1/order/',
        getOrderItem: (id) => {
            return `/api/v1/order/${id}/`
        },
        subscriptionListUrl: '/api/v1/subscription/',
        getSubscriptionItem: (id) => {
            return `/api/v1/subscription/${id}/`
        },


        //search
        searchUrl: '/api/v1/search/',
        getSearchHistoryUrl: '/api/v1/search/history/',//GET
        createSearchHistoryUrl: '/api/v1/search/history/', //POST
        removeSearchHistoryUrl: (id) => {
            return `/api/v1/search/${id}/remove_from_history/`
        },
        // Community URLs
        myCommunitiesUrl: '/api/v1/community/as-member/',
        invitedCommunitiesUrl: '/api/v1/community/invitations/',
        communityMembersUrl: (id) => {
            return `/api/v1/community/${id}/members/`
        },
        communityFilesUrl: (id) => {
            return `/api/v1/community/${id}/files/`
        },
        communityList:'/api/v1/community/',
        // Profile URLs
        myProfileUrl: '/api/v1/profile/me/',
        profileUrl: (id:number) => {
            return `/api/v1/profile/${id}/`
        },
        profilesUrl: '/api/v1/profile/',
        myBusinessDataUrl:"/api/v1/profile/business_data/",
        myPersonalDataUrl:"/api/v1/profile/personal_data/",
        // Friends URLs
        friendsUrl: '/api/v1/friends/',

        // Group URLs
        groupsUrl: '/api/v1/group/',
        myGroupsUrl: '/api/v1/group/as-member/',
        groupFilesUrl: (id) => {
            return `/api/v1/group/${id}/files/`
        },

        // Project URLs
        projectUrl: '/api/v1/project/',
        projectDetailUrl: (id) => {
            return `/api/v1/project/${id}/`
        },
        taskUrl: '/api/v1/task/',

        productsPlans: '/api/v1/products/plan/',
        productsSKU: '/api/v1/products/sku/',

        orderCoupon: '/api/v1/order/coupon/',
        orderUpdate: '/api/v1/order/order_update/',
        orderConfirm: '/api/v1/order/order_confirm/',
        orderPay: '/api/v1/order/pay_order/',

        addCardSource:'/api/v1/source/add/',
        getCardSource: (customerId) => {
            return `/api/v1/source/get/?id=${encodeURIComponent(customerId)}`
        },
        projectTeamProfilesUrl: (id) => {
            return `/api/v1/project/${id}/team/`
        },
        projectTasksUrl: (id) => {
            return `/api/v1/project/${id}/tasks/`
        },
        taskSubTasksUrl: (id) => {
            return `/api/v1/task/${id}/subtasks/`
        },
        taskDetailUrl: (id) => {
            return `/api/v1/task/${id}/`
        },
        projectFilesUrl: (id) => {
            return `/api/v1/project/${id}/files/`
        },
        timeSheetUrl: '/api/v1/timesheet/',
        timeSheetDetailUrl: (id) => {
            return `/api/v1/timesheet/${id}/`
        },
        timeSheetRemoveUrl: (id) => {
            return `/api/v1/timesheet/${id}/`
        },

        // Event URLs
        upcomingEventsUrl: '/api/v1/event/upcoming/',
        eventFilesUrl: (id) => {
            return `/api/v1/event/${id}/files/`
        },

        // Notification URLs
        notificationUrl: '/api/v1/notification/',
        notificationLastActivityTimeUrl: '/api/v1/notification/last-activity-time/',
        notificationUnreadUrl: '/api/v1/notification/unread-count/',
        notificationMarkReadUrl: '/api/v1/notification/update-as-read/',
        notificationMarkAllReadUrl: '/api/v1/notification/mark-all-as-read/',

        // Conversation Notification URLs
        convNotificationUrl: '/api/v1/notification_conv/',
        convNotificationLastActivityTimeUrl: '/api/v1/notification_conv/last-activity-time/',
        convNotificationUnreadUrl: '/api/v1/notification_conv/unread-count/',
        convNotificationMarkReadUrl: '/api/v1/notification_conv/update-as-read/',
        convNotificationMarkAllReadUrl: '/api/v1/notification_conv/mark-all-as-read/',

        // Other
        postUrl: '/api/v1/status/',
        postUpdateUrl: (id) => {
            return `/api/v1/status/${id}/`
        },
        postLike: (id) => {
            return `/api/v1/status/${id}/like/`
        },
        fileUploadUrl: '/api/v1/file-upload/',
        conversationMessagesUrl: (id) => {
            return `/api/v2/conversation/${id}/messages/`
        },
        conversations: '/api/v2/conversation/',
        composeMessageUrl: '/api/v1/conversation/compose/',

        //report
        reportUrl: (context_type, context_object_id) => {
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
        projectDetailUrl: (id, name) => {
            return `/project/${id}/${name}`
        },
        filesGrid: '/files/grid/',
        filesContentObjectGrid: (model, id) => {
            return `/files/grid/?content_type=${model}&object_id=${id}`
        },
        openUploadedFile: (id) => {
            return `/files/open/uploaded-file/${id}/`
        },
        downloadUploadedFile: (id) => {
            return `/files/download/uploaded-file/${id}/`
        },
        statusPermalink: (id) => {
            return `/status/${id}/`
        },
        notificationsConfig: "/notification/config/",
        notificationsAll: "/notification/",
        searchWithTags: (tag) => {
            return `/search/?term=${encodeURIComponent(tag)}`
        },
    },

    defaultImg: {
        user: 'img/default-user.png',
        group: 'img/default-widget.jpg',
        event: 'img/default-widget.jpg'
    }
};
