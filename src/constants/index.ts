export const TECHNOLOGIES = [
  'AI Engineer','Data Engineer','.NET','Java','Python',
  'SAP','QE - Functional','QE - Automation','QE - Security','QE - Performance',
] as const;

export const AVAILABILITIES = ['Available','Engaged','Notice Period'] as const;

export const SKILLS_BY_TECH: Record<string, string[]> = {
  'AI Engineer':     ['PyTorch','TensorFlow','LLM Fine-tuning','RAG','LangChain','Computer Vision','MLOps','Hugging Face'],
  'Data Engineer':   ['Spark','Airflow','Snowflake','dbt','Kafka','BigQuery','Databricks','ETL'],
  '.NET':            ['C#','ASP.NET Core','Entity Framework','Azure','Blazor','SignalR','Web API','LINQ'],
  'Java':            ['Spring Boot','Hibernate','Microservices','Kafka','JUnit','Maven','Kubernetes','REST'],
  'Python':          ['Django','FastAPI','Flask','Pandas','Celery','AsyncIO','Pytest','SQLAlchemy'],
  'SAP':             ['SAP ABAP','SAP FICO','SAP MM','SAP HANA','S/4HANA','SAP SD','Fiori','BTP'],
  'QE - Functional': ['Manual Testing','Test Cases','JIRA','Regression','SDLC','API Testing'],
  'QE - Automation': ['Selenium','Cypress','Playwright','TestNG','Appium','CI/CD','Rest Assured'],
  'QE - Security':   ['OWASP','Burp Suite','Pen Testing','SAST','DAST','Threat Modeling'],
  'QE - Performance':['JMeter','Gatling','LoadRunner','k6','Profiling','Stress Testing'],
};

export const PAGE_SIZE = 10;

export const DEMO_CREDENTIALS = {
  client:    { email: 'client@acme.com',          password: 'qpact123' },
  recruiter: { email: 'asha@talentbridge.in',      password: 'qpact123' },
  admin:     { email: 'admin@qpact.io',            password: 'admin123' },
};
