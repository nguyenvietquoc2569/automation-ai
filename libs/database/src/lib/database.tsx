import styles from './database.module.css';

// Re-export all database functionality from individual modules
export * from './models/user.model';
export * from './models/organization.model';
export * from './models/service.model';
export * from './models/agent.model';
export * from './models/session.model';
export * from './connection';
export * from './database-service';
export * from './session-service';

// Re-export types from the types library
export { ServiceCategory } from '@automation-ai/types';

export function Database() {
  return (
    <div className={styles['container']}>
      <h1>Welcome to Database!</h1>
      <p>MongoDB database library for automation-ai</p>
    </div>
  );
}

export default Database;
