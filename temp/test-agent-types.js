"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
// Test file to demonstrate IAgent usage
var types_1 = require("@automation-ai/types");
// Example service
var facebookService = {
    _id: 'service_facebook_001',
    serviceName: 'Facebook Automation Service',
    description: 'Automate Facebook marketing and social media management',
    category: types_1.ServiceCategory.AUTOMATION,
    serviceShortName: 'fb-auto',
    tags: ['facebook', 'social-media', 'marketing', 'automation'],
    createdAt: new Date(),
    updatedAt: new Date()
};
// Example: Organization subscribes to the Facebook service and creates an agent
var newAgent = {
    agentName: 'My Company FB Bot',
    description: 'Handles our company\'s Facebook page automation',
    serviceId: facebookService._id,
    organizationId: 'org_123',
    isActive: true,
    configuration: {
        pageId: 'my_facebook_page_id',
        autoReply: true,
        postScheduling: true,
        maxPostsPerDay: 3
    },
    credentials: {
        accessToken: 'encrypted_facebook_access_token',
        appSecret: 'encrypted_app_secret'
    },
    metadata: {
        version: '1.0.0',
        syncInterval: 30, // 30 minutes
        maxRetries: 3
    },
    permissions: [
        'read_posts',
        'write_posts',
        'manage_comments',
        'view_insights'
    ],
    restrictions: {
        rateLimits: {
            requestsPerMinute: 10,
            requestsPerHour: 200,
            requestsPerDay: 1000
        },
        allowedOperations: ['post', 'comment', 'like', 'share'],
        timeConstraints: {
            startTime: '09:00',
            endTime: '18:00',
            timezone: 'America/New_York',
            allowedDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        }
    },
    status: types_1.AgentStatus.CONFIGURING
};
// Example: The agent instance after creation
var myFacebookAgent = __assign(__assign({ _id: 'agent_fb_001' }, newAgent), { status: types_1.AgentStatus.ACTIVE, lastActivity: new Date(), createdBy: 'user_admin_001', createdAt: new Date(), updatedAt: new Date() });
console.log('✅ Agent types created successfully!');
console.log('Service:', facebookService.serviceName);
console.log('Agent:', myFacebookAgent.agentName);
console.log('Status:', myFacebookAgent.status);
console.log('Organization:', myFacebookAgent.organizationId);
// Demonstrate the relationship:
// 1. Service (IService) - The template/blueprint (e.g., "Facebook Automation Service")  
// 2. Organization subscribes to the service
// 3. Agent (IAgent) - Instance of the service for that organization (e.g., "My Company FB Bot")
console.log('\\n📝 Relationship Overview:');
console.log('🔹 Service provides the template and capabilities');
console.log('🔹 Organization subscribes to the service');
console.log('🔹 Agent is created as an instance of the service for the organization');
console.log('🔹 Multiple agents can be created from the same service for different purposes');
