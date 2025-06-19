#!/usr/bin/env node

/**
 * Database seeding script for agent services
 * 
 * This script adds the following agent services to the database:
 * 1. Facebook Auto Post Agent Service
 * 2. TikTok Auto Post Agent Service  
 * 3. Orchestrations Agent Service
 */

import { databaseService } from '../lib/database-service';
import { Service } from '../lib/models/service.model';
import { ServiceCategory } from '@automation-ai/types';

// Service definitions
const agentServices = [
  {
    serviceName: 'Facebook Auto Post Agent Service',
    description: 'Automated posting service for Facebook social media platform. Handles content scheduling, posting, engagement monitoring, and analytics for Facebook business pages and personal profiles.',
    category: ServiceCategory.AUTOMATION,
    serviceShortName: 'facebook-auto-post',
    tags: ['facebook', 'social-media', 'automation', 'posting', 'scheduling', 'marketing', 'agent']
  },
  {
    serviceName: 'TikTok Auto Post Agent Service',
    description: 'Intelligent TikTok content automation service. Manages video uploads, hashtag optimization, trend analysis, scheduling, and engagement tracking for TikTok business and creator accounts.',
    category: ServiceCategory.AUTOMATION,
    serviceShortName: 'tiktok-auto-post',
    tags: ['tiktok', 'social-media', 'automation', 'video', 'trending', 'hashtags', 'agent', 'content']
  },
  {
    serviceName: 'Orchestrations Agent Service',
    description: 'Advanced workflow orchestration and automation service. Coordinates multiple agents, manages complex business processes, handles task scheduling, and provides intelligent workflow management across different systems.',
    category: ServiceCategory.AUTOMATION,
    serviceShortName: 'orchestrations-agent',
    tags: ['orchestration', 'workflow', 'automation', 'coordination', 'scheduling', 'process-management', 'agent', 'integration']
  }
];

/**
 * Check if a service already exists
 */
async function serviceExists(serviceShortName: string): Promise<boolean> {
  try {
    const existingService = await Service.findOne({ serviceShortName });
    return !!existingService;
  } catch (error) {
    console.error(`Error checking if service exists: ${serviceShortName}`, error);
    return false;
  }
}

/**
 * Create a new service in the database
 */
async function createService(serviceData: typeof agentServices[0]): Promise<void> {
  try {
    const exists = await serviceExists(serviceData.serviceShortName);
    
    if (exists) {
      console.log(`✓ Service already exists: ${serviceData.serviceName} (${serviceData.serviceShortName})`);
      return;
    }

    const service = new Service(serviceData);
    await service.save();
    
    console.log(`✅ Created service: ${serviceData.serviceName} (${serviceData.serviceShortName})`);
    console.log(`   Description: ${serviceData.description.substring(0, 80)}...`);
    console.log(`   Category: ${serviceData.category}`);
    console.log(`   Tags: ${serviceData.tags.join(', ')}`);
    console.log('');
    
  } catch (error) {
    console.error(`❌ Failed to create service: ${serviceData.serviceName}`, error);
    throw error;
  }
}

/**
 * Main seeding function
 */
async function seedAgentServices(): Promise<void> {
  console.log('🚀 Starting agent services seeding...\n');
  
  try {
    // Initialize database connection
    await databaseService.initialize();
    console.log('📊 Database connection established\n');
    
    // Create each service
    for (const serviceData of agentServices) {
      await createService(serviceData);
    }
    
    console.log('🎉 Agent services seeding completed successfully!');
    
    // Verify services were created
    const totalServices = await Service.countDocuments();
    const agentServiceCount = await Service.countDocuments({ 
      serviceShortName: { $in: agentServices.map(s => s.serviceShortName) } 
    });
    
    console.log(`📈 Total services in database: ${totalServices}`);
    console.log(`🤖 Agent services created/verified: ${agentServiceCount}/${agentServices.length}`);
    
  } catch (error) {
    console.error('💥 Error during seeding:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await databaseService.shutdown();
    console.log('📴 Database connection closed');
  }
}

/**
 * List all existing services (utility function)
 */
export async function listAllServices(): Promise<void> {
  try {
    await databaseService.initialize();
    
    const services = await Service.find({}).sort({ category: 1, serviceName: 1 });
    
    console.log(`\n📋 All Services in Database (${services.length} total):`);
    console.log('='.repeat(60));
    
    const servicesByCategory = services.reduce((acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = [];
      }
      acc[service.category].push(service);
      return acc;
    }, {} as Record<string, typeof services>);
    
    for (const [category, categoryServices] of Object.entries(servicesByCategory)) {
      console.log(`\n📂 ${category.toUpperCase()}:`);
      categoryServices.forEach((service, index) => {
        console.log(`  ${index + 1}. ${service.serviceName} (${service.serviceShortName})`);
        console.log(`     📝 ${service.description.substring(0, 100)}...`);
        console.log(`     🏷️  Tags: ${service.tags.join(', ')}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('Error listing services:', error);
  } finally {
    await databaseService.shutdown();
  }
}

// Run the seeding if this script is executed directly
if (require.main === module) {
  seedAgentServices().catch(console.error);
}

export { seedAgentServices, agentServices };
