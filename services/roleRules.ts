export const roleRules: Record<string, string> = {
  FRONTEND_DEVELOPER: `
### Role-Specific Rules: Frontend Developer
**Must-have keywords (penalize heavily if missing):**
- Core: HTML, CSS, JavaScript, TypeScript
- Frameworks: React, Next.js, Vue, or Angular (at least one)
- Styling: Tailwind CSS, SCSS, Styled Components, or similar
- State management: Redux, Zustand, Jotai, Context API
- Build tools: Webpack, Vite, or similar

**Bonus keywords (reward if present):**
- Performance: Lighthouse scores, Core Web Vitals, lazy loading, code splitting
- Animation: Framer Motion, GSAP, CSS animations
- Testing: Jest, Cypress, Playwright, React Testing Library
- Accessibility: WCAG, ARIA, semantic HTML

**Penalize for:**
- No mention of responsive design
- No component architecture knowledge
- Projects with no live links or visual output
- Only backend technologies listed

**CRITICAL SCORING NOTE:**
If the resume has ZERO of these: React, Vue, Angular, Next.js, HTML, CSS, JavaScript —
keywordMatch MUST be scored 0–5 out of 30. No frontend stack means no alignment.
`,

  BACKEND_DEVELOPER: `
### Role-Specific Rules: Backend Developer
**Must-have keywords (penalize heavily if missing):**
- Languages: Node.js, Python, Java, Go, or Rust (at least one)
- Frameworks: Express, FastAPI, Django, Spring, NestJS (at least one)
- Databases: PostgreSQL, MySQL, MongoDB, Redis (at least one SQL + one NoSQL)
- API design: REST, GraphQL, or gRPC

**Bonus keywords (reward if present):**
- Auth: JWT, OAuth2, session management
- Infrastructure: Docker, Kubernetes, CI/CD, AWS/GCP/Azure
- Performance: caching strategies, rate limiting, database indexing
- Message queues: RabbitMQ, Kafka, BullMQ
- Testing: unit tests, integration tests, load testing

**Penalize for:**
- No database experience mentioned
- Only frontend technologies listed
- No mention of API design or architecture
- No server deployment or hosting experience

**CRITICAL SCORING NOTE:**
If the resume has ZERO of these: Node.js, Python, Java, Go, Express, Django, PostgreSQL, MySQL, MongoDB —
keywordMatch MUST be scored 0–5 out of 30. No backend stack means no alignment.
`,

  ANDROID_DEVELOPER: `
### Role-Specific Rules: Android Developer
**Must-have keywords (penalize heavily if missing):**
- Languages: Kotlin (primary), Java (acceptable)
- UI: Jetpack Compose or XML layouts
- Android SDK, Android Studio
- Core: Activities, Fragments, ViewModel, LiveData/StateFlow

**Bonus keywords (reward if present):**
- Architecture: MVVM, MVI, Clean Architecture
- Jetpack: Room, Navigation, WorkManager, DataStore
- Networking: Retrofit, OkHttp
- DI: Hilt or Dagger
- Testing: Espresso, JUnit
- Published apps on Google Play Store (huge bonus)
- App metrics: downloads, ratings, active users

**Penalize for:**
- No Kotlin — Java only is a red flag in 2024
- No mention of Jetpack libraries
- Only web technologies listed
- No published or deployed app

**CRITICAL SCORING NOTE:**
If the resume has ZERO of these: Kotlin, Java, Android SDK, Jetpack Compose, Android Studio —
keywordMatch MUST be scored 0–5 out of 30. No Android stack means no alignment.
A web developer resume is completely misaligned with Android development.
`,

  IOS_DEVELOPER: `
### Role-Specific Rules: iOS Developer
**Must-have keywords (penalize heavily if missing):**
- Languages: Swift (primary), Objective-C (acceptable but outdated)
- UI: SwiftUI (preferred) or UIKit
- Xcode, iOS SDK
- Core: ViewControllers, Auto Layout, Storyboard or programmatic UI

**Bonus keywords (reward if present):**
- Architecture: MVVM, MVC, Clean Architecture
- Frameworks: Combine, CoreData, CoreLocation, AVFoundation
- Networking: URLSession, Alamofire
- DI: Swinject or manual DI
- Testing: XCTest, XCUITest
- Published apps on App Store (huge bonus)
- App metrics: downloads, ratings, active users

**Penalize for:**
- No Swift — Objective-C only is a significant red flag
- No mention of SwiftUI or UIKit
- Only web/backend technologies listed
- No published or deployed app

**CRITICAL SCORING NOTE:**
If the resume has ZERO of these: Swift, Objective-C, SwiftUI, UIKit, Xcode, iOS SDK —
keywordMatch MUST be scored 0–5 out of 30. No iOS stack means no alignment.
A web developer resume is completely misaligned with iOS development.
`,

  FULLSTACK_DEVELOPER: `
### Role-Specific Rules: Fullstack Developer
**Must-have keywords (penalize heavily if missing):**
- Frontend: React, Next.js, Vue, or Angular (at least one)
- Backend: Node.js, Python, Java, or Go (at least one)
- Database: at least one SQL and awareness of NoSQL
- API: REST or GraphQL
- Deployment: any cloud provider or platform (Vercel, Railway, AWS, etc.)

**Bonus keywords (reward if present):**
- TypeScript on both frontend and backend
- Docker, CI/CD pipelines
- Authentication implementation (JWT, OAuth)
- Real-time features (WebSockets, SSE)
- Monorepo experience (Turborepo, Nx)
- Full end-to-end projects with real users

**Penalize for:**
- Strong in only one side (pure frontend or pure backend)
- No deployment experience
- No database design knowledge
- Projects that are only frontend with mock data

**CRITICAL SCORING NOTE:**
If the resume has ZERO frontend AND backend keywords from this list: React, Next.js, Vue, Node.js, Python, Java, PostgreSQL, MongoDB —
keywordMatch MUST be scored 0–5 out of 30. One-sided stack means partial alignment at best, score accordingly.
`,

  AI_ML_DEVELOPER: `
### Role-Specific Rules: AI/ML Developer
**Must-have keywords (penalize heavily if missing):**
- Languages: Python (mandatory)
- ML frameworks: TensorFlow, PyTorch, or scikit-learn (at least one)
- Data: NumPy, Pandas
- Concepts: supervised/unsupervised learning, model training, evaluation metrics

**Bonus keywords (reward if present):**
- LLMs: OpenAI API, LangChain, HuggingFace, fine-tuning
- MLOps: model deployment, FastAPI/Flask serving, Docker
- Deep learning: CNNs, RNNs, Transformers
- Data pipelines: Airflow, Spark, or similar
- Research: papers published, Kaggle rankings, competition results
- Real deployed ML models in production

**Penalize for:**
- No Python
- No actual model training — only API calls to existing models
- No understanding of math fundamentals (linear algebra, statistics)
- Projects with no evaluation metrics or results

**CRITICAL SCORING NOTE:**
If the resume has ZERO of these: Python, TensorFlow, PyTorch, scikit-learn, NumPy, Pandas —
keywordMatch MUST be scored 0–5 out of 30. A web developer with no ML stack
is fundamentally misaligned with AI/ML.
`,

  DATA_SCIENCE: `
### Role-Specific Rules: Data Science
**Must-have keywords (penalize heavily if missing):**
- Languages: Python or R (Python strongly preferred)
- Libraries: Pandas, NumPy, Matplotlib/Seaborn
- ML: scikit-learn at minimum
- SQL: must have database querying experience
- Statistics: hypothesis testing, regression, probability

**Bonus keywords (reward if present):**
- Visualization: Tableau, Power BI, Plotly, Dash
- Big data: Spark, Hadoop, BigQuery
- Experimentation: A/B testing, statistical significance
- Business impact: revenue driven, cost saved, accuracy improved by X%
- Published notebooks: Kaggle, GitHub, Observable
- Domain expertise: finance, healthcare, e-commerce

**Penalize for:**
- No SQL experience
- No statistical knowledge mentioned
- Only ML frameworks with no data wrangling experience
- No visualization or communication of results
- Projects with no stated accuracy, metrics, or business impact

**CRITICAL SCORING NOTE:**
If the resume has ZERO of these: Python, R, Pandas, NumPy, SQL, scikit-learn, statistics —
keywordMatch MUST be scored 0–5 out of 30. No data science tools means no alignment.
`,

  UI_UX: `
### Role-Specific Rules: UI/UX Designer
**Must-have keywords (penalize heavily if missing):**
- Tools: Figma (mandatory in 2024), Adobe XD or Sketch (acceptable)
- Process: user research, wireframing, prototyping, usability testing
- Deliverables: design systems, component libraries, style guides
- Concepts: information architecture, user flows, personas

**Bonus keywords (reward if present):**
- Quantified UX impact: "reduced drop-off by 30%", "increased conversions by X%"
- Accessibility: WCAG compliance, inclusive design
- Frontend knowledge: HTML, CSS, basic React (huge bonus for UI/UX)
- Motion design: micro-interactions, prototyping in Figma
- Portfolio with case studies (no portfolio = severe penalty for this role)
- User testing: interviews, surveys, heatmaps, session recordings

**Penalize for:**
- No Figma or design tool mentioned
- No portfolio link — this is the most critical thing for UI/UX
- No mention of user research or testing process
- Only visual design with no UX thinking
- No case studies showing problem → solution → outcome

**CRITICAL SCORING NOTE:**
If the resume has ZERO of these: Figma, Adobe XD, wireframing, prototyping, user research —
keywordMatch MUST be scored 0–5 out of 30. A developer resume with no design tools
is fundamentally misaligned with UI/UX.
`,

  DEVOPS: `
### Role-Specific Rules: DevOps Engineer
**Must-have keywords (penalize heavily if missing):**
- Containers: Docker (mandatory), Kubernetes (strongly preferred)
- CI/CD: GitHub Actions, Jenkins, GitLab CI, or CircleCI
- Cloud: AWS, GCP, or Azure (at least one)
- IaC: Terraform or Ansible
- Scripting: Bash, Python, or Go

**Bonus keywords (reward if present):**
- Monitoring: Prometheus, Grafana, Datadog, ELK stack
- Security: SAST, DAST, secrets management, IAM
- Networking: load balancers, VPCs, DNS, CDN
- GitOps: ArgoCD, Flux
- Cost optimization: cloud cost reduction achievements
- On-call experience, incident management, SLAs/SLOs

**Penalize for:**
- No cloud experience
- No CI/CD pipeline experience
- Only development experience with no infrastructure knowledge
- No scripting or automation skills
- No mention of monitoring or observability

**CRITICAL SCORING NOTE:**
If the resume has ZERO of these: Docker, Kubernetes, CI/CD, Terraform, Ansible, cloud platforms —
keywordMatch MUST be scored 0–5 out of 30. No exceptions. A web developer resume 
is NOT partially aligned with DevOps. It is fundamentally misaligned on the most 
heavily weighted dimension.

`,
};