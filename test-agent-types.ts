// Test file to demonstrate IAgent usage
import { 
  IService, 
  IAgent, 
  CreateAgentDto, 
  AgentStatus, 
  ServiceCategory 
} from '@automation-ai/types';

// Example service
const facebookService: IService = {
  _id: 'service_facebook_001',
  serviceName: 'Facebook Automation Service',
  description: 'Automate Facebook marketing and social media management',
  category: ServiceCategory.AUTOMATION,
  serviceShortName: 'fb-auto',
  tags: ['facebook', 'social-media', 'marketing', 'automation'],
  createdAt: new Date(),
  updatedAt: new Date()
};

// Example: Organization subscribes to the Facebook service and creates an agent
const newAgent: CreateAgentDto = {
  agentName: 'My Company FB Bot',
  description: 'Handles our company\'s Facebook page automation',
  serviceId: facebookService._id!,
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
  status: AgentStatus.CONFIGURING
};

// Example: The agent instance after creation
const myFacebookAgent: IAgent = {
  _id: 'agent_fb_001',
  ...newAgent,
  status: AgentStatus.ACTIVE,
  lastActivity: new Date(),
  createdBy: 'user_admin_001',
  createdAt: new Date(),
  updatedAt: new Date()
};

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
