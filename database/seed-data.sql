-- ===================================================================
-- QuizTrack Seed Data
-- 5 Categories, 5 Quizzes, 10 Questions each (50 total questions with 4 options),
-- 1 Admin, 3 Users, Badges, Historical Attempts, and Activity Logs.
-- ===================================================================

USE quiztrack_db;

-- 1. ROLES
INSERT INTO roles (id, name, description) VALUES
(1, 'ROLE_ADMIN', 'System Administrator with full access to manage quizzes, users and metrics'),
(2, 'ROLE_USER', 'Standard user who can take quizzes, view analytics, and earn certificates');

-- 2. USERS
-- Passwords: Admin@123 for admin, User@123 for users
-- BCrypt: $2a$10$7Z2N2x2mN6gA8Jd8mBqEbeN/841E3U1oDqB9E7eN3uLdKqEwB8f8i (or standard BCrypt)
-- Note: Spring DataInitializer also ensures BCrypt compatibility on app start.
INSERT INTO users (id, email, password_hash, first_name, last_name, avatar_url, bio, is_active, is_blocked, xp_points, current_level, current_streak, longest_streak, last_active_date) VALUES
(1, 'admin@quiztrack.io', '$2a$10$eACCYoNOHEqgkvd8aYPKEOGvV2u2ypDYz7Mt8HPW3flgUWy8daUaK', 'Sarah', 'Connor', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80', 'Lead Platform Architect & Administrator at QuizTrack.', TRUE, FALSE, 3500, 10, 14, 21, CURDATE()),
(2, 'alice@quiztrack.io', '$2a$10$eACCYoNOHEqgkvd8aYPKEOGvV2u2ypDYz7Mt8HPW3flgUWy8daUaK', 'Alice', 'Walker', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80', 'Frontend developer leveling up fullstack & Spring Boot skills.', TRUE, FALSE, 1450, 4, 5, 8, CURDATE()),
(3, 'bob@quiztrack.io', '$2a$10$eACCYoNOHEqgkvd8aYPKEOGvV2u2ypDYz7Mt8HPW3flgUWy8daUaK', 'Bob', 'Martinez', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80', 'DevOps engineer passionate about cloud-native infrastructure.', TRUE, FALSE, 820, 2, 2, 4, CURDATE()),
(4, 'charlie@quiztrack.io', '$2a$10$eACCYoNOHEqgkvd8aYPKEOGvV2u2ypDYz7Mt8HPW3flgUWy8daUaK', 'Charlie', 'Davis', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80', 'Software engineer preparing for high-scale backend interviews.', TRUE, FALSE, 2150, 6, 9, 12, CURDATE());

-- Assign Roles
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1), -- Sarah is ADMIN
(1, 2), -- Sarah also has USER role
(2, 2), -- Alice is USER
(3, 2), -- Bob is USER
(4, 2); -- Charlie is USER

-- 3. CATEGORIES
INSERT INTO categories (id, name, slug, description, icon_name, color_code) VALUES
(1, 'Web Development & JavaScript', 'web-development', 'Modern React, ESNext, TypeScript, DOM and Web performance.', 'Code2', '#3B82F6'),
(2, 'Java & Spring Framework', 'java-spring', 'Core Java concurrency, Spring Boot 3, Spring Security & JPA patterns.', 'Coffee', '#10B981'),
(3, 'Database & SQL Systems', 'database-sql', 'Relational design, indexing, transactions, ACID, and query optimization.', 'Database', '#8B5CF6'),
(4, 'Cloud Computing & DevOps', 'cloud-devops', 'Docker containers, Kubernetes orchestration, CI/CD, and AWS architecture.', 'Cloud', '#F59E0B'),
(5, 'Data Structures & Algorithms', 'dsa-algorithms', 'Algorithm analysis, dynamic programming, trees, graphs, and system design.', 'Cpu', '#EC4899');

-- 4. TAGS
INSERT INTO tags (id, name, slug) VALUES
(1, 'React', 'react'),
(2, 'JavaScript', 'javascript'),
(3, 'Spring Boot', 'spring-boot'),
(4, 'Java', 'java'),
(5, 'MySQL', 'mysql'),
(6, 'Indexing', 'indexing'),
(7, 'Docker', 'docker'),
(8, 'Kubernetes', 'kubernetes'),
(9, 'Algorithms', 'algorithms'),
(10, 'Concurrency', 'concurrency');

-- 5. QUIZZES
INSERT INTO quizzes (id, category_id, created_by_user_id, title, slug, description, difficulty, duration_minutes, pass_percentage, negative_marking, negative_marking_deduction, per_question_timer_seconds, is_published, shuffle_questions, shuffle_options, max_violations_allowed) VALUES
(1, 1, 1, 'Full-Stack JavaScript & React Mastery', 'react-javascript-mastery', 'Test your skills in modern JavaScript (ES6+), React hooks, virtual DOM reconciler, and state management.', 'MEDIUM', 15, 70.00, TRUE, 0.25, 60, TRUE, TRUE, TRUE, 3),
(2, 2, 1, 'Spring Boot 3 & Microservices Architecture', 'spring-boot-microservices', 'Deep dive into Spring Framework 6, dependency injection, Spring Security 6 JWT, and distributed transactions.', 'MEDIUM', 20, 65.00, FALSE, 0.00, 0, TRUE, TRUE, TRUE, 3),
(3, 3, 1, 'MySQL & High-Performance Relational DBs', 'mysql-database-mastery', 'Master relational schemas, B-Tree indexes, isolation levels, execution plans, and query optimization.', 'MEDIUM', 15, 60.00, TRUE, 0.25, 0, TRUE, TRUE, TRUE, 2),
(4, 4, 1, 'Docker, Kubernetes & Cloud DevOps', 'docker-kubernetes-devops', 'Verify your operational knowledge of containerization, Pod lifecycle, Helm charts, and CI/CD pipelines.', 'HARD', 20, 70.00, TRUE, 0.50, 0, TRUE, TRUE, TRUE, 2),
(5, 5, 1, 'Advanced Data Structures & Algorithms', 'advanced-dsa-optimization', 'Challenge your problem-solving with trees, DP, graph traversal, asymptotic complexity, and memoization.', 'HARD', 25, 60.00, FALSE, 0.00, 0, TRUE, TRUE, TRUE, 3);

-- Link Quizzes to Tags
INSERT INTO quiz_tags (quiz_id, tag_id) VALUES
(1, 1), (1, 2),
(2, 3), (2, 4), (2, 10),
(3, 5), (3, 6),
(4, 7), (4, 8),
(5, 9);

-- 6. QUESTIONS & OPTIONS
-- -------------------------------------------------------------
-- QUIZ 1: JavaScript & React (Questions 1 to 10)
-- -------------------------------------------------------------
INSERT INTO questions (id, quiz_id, question_text, question_type, marks, explanation, order_index) VALUES
(1, 1, 'What is the primary difference between useEffect and useLayoutEffect in React?', 'SINGLE', 1.00, 'useEffect runs asynchronously after the DOM paint is painted to screen. useLayoutEffect fires synchronously after all DOM mutations but before the browser paints.', 1),
(2, 1, 'Which of the following statements about JavaScript closures are TRUE? (Select all that apply)', 'MULTI', 2.00, 'A closure gives an inner function access to an outer function scope. Closures retain variables by reference, not by creating static copies.', 2),
(3, 1, 'What will `console.log(typeof NaN)` output in standard ECMAScript?', 'SINGLE', 1.00, 'In JavaScript, NaN (Not-a-Number) is a numeric data type representing an undefined or unrepresentable numerical result.', 3),
(4, 1, 'How does React Virtual DOM reconciliation identify elements across renders?', 'SINGLE', 1.00, 'React uses unique "key" props among sibling elements to match children in the original tree with children in the subsequent tree.', 4),
(5, 1, 'Which array methods mutate the original array in place in JavaScript? (Select all that apply)', 'MULTI', 2.00, 'splice(), sort(), and reverse() mutate the original array. filter(), map(), and slice() return a brand new array without modifying the source.', 5),
(6, 1, 'What is the purpose of React.memo()?', 'SINGLE', 1.00, 'React.memo is a higher-order component that memoizes the rendered output of a component to skip re-rendering if its props have not changed.', 6),
(7, 1, 'What is the output of `[1, 2, 3] + [4, 5, 6]` in JavaScript?', 'SINGLE', 1.00, 'The addition operator converts both operands to strings and concatenates them, resulting in "1,2,34,5,6".', 7),
(8, 1, 'Which hook should you use to store a mutable value that does NOT trigger a re-render when modified?', 'SINGLE', 1.00, 'useRef returns a mutable ref object whose .current property is initialized to the passed argument. Mutating .current does not trigger re-rendering.', 8),
(9, 1, 'What does the JavaScript Event Loop do when the Call Stack is empty?', 'SINGLE', 1.00, 'It processes all microtasks (Promises, queueMicrotask) first, then pulls the next macrotask (setTimeout, setInterval, I/O) from the task queue.', 9),
(10, 1, 'What happens if you update state inside a React useEffect without a dependency array?', 'SINGLE', 1.00, 'Without a dependency array, useEffect executes after every single render. Updating state causes a re-render, leading to an infinite render loop.', 10);

-- Options for Quiz 1
INSERT INTO question_options (question_id, option_text, is_correct, order_index) VALUES
-- Q1
(1, 'useLayoutEffect runs synchronously before browser paint; useEffect runs asynchronously after paint.', TRUE, 1),
(1, 'useEffect runs before DOM updates; useLayoutEffect runs after server rendering.', FALSE, 2),
(1, 'There is no difference; useLayoutEffect is simply deprecated.', FALSE, 3),
(1, 'useEffect runs on the server while useLayoutEffect runs exclusively on web workers.', FALSE, 4),
-- Q2 (MULTI)
(2, 'A closure gives an inner function access to its outer enclosing scope.', TRUE, 1),
(2, 'Closures can help encapsulate private variables in modules.', TRUE, 2),
(2, 'Variables captured in closures are garbage collected immediately upon function return.', FALSE, 3),
(2, 'Closures only work when declared using the arrow function syntax.', FALSE, 4),
-- Q3
(3, 'number', TRUE, 1),
(3, 'nan', FALSE, 2),
(3, 'undefined', FALSE, 3),
(3, 'object', FALSE, 4),
-- Q4
(4, 'The "key" prop assigned to sibling elements', TRUE, 1),
(4, 'The HTML id attribute', FALSE, 2),
(4, 'The memory address of the component instance', FALSE, 3),
(4, 'The index in the global React fiber stack', FALSE, 4),
-- Q5 (MULTI)
(5, 'Array.prototype.splice()', TRUE, 1),
(5, 'Array.prototype.sort()', TRUE, 2),
(5, 'Array.prototype.map()', FALSE, 3),
(5, 'Array.prototype.filter()', FALSE, 4),
-- Q6
(6, 'Prevents component re-rendering if props are shallowly equal', TRUE, 1),
(6, 'Caches asynchronous API network responses', FALSE, 2),
(6, 'Stores component state into browser localStorage automatically', FALSE, 3),
(6, 'Binds event handlers to the React fiber root', FALSE, 4),
-- Q7
(7, '"1,2,34,5,6"', TRUE, 1),
(7, '[1, 2, 3, 4, 5, 6]', FALSE, 2),
(7, 'TypeError: cannot concatenate arrays', FALSE, 3),
(7, 'NaN', FALSE, 4),
-- Q8
(8, 'useRef', TRUE, 1),
(8, 'useState', FALSE, 2),
(8, 'useMemo', FALSE, 3),
(8, 'useCallback', FALSE, 4),
-- Q9
(9, 'Executes all pending microtasks before taking the next macrotask', TRUE, 1),
(9, 'Executes macrotasks first, followed by microtasks', FALSE, 2),
(9, 'Shuts down the Node.js runtime or browser thread', FALSE, 3),
(9, 'Immediately renders CSS animations regardless of queue state', FALSE, 4),
-- Q10
(10, 'An infinite re-render loop occurs', TRUE, 1),
(10, 'React throws a CompileTimeException', FALSE, 2),
(10, 'The effect is completely ignored by React', FALSE, 3),
(10, 'The state update will be batched only once per session', FALSE, 4);

-- -------------------------------------------------------------
-- QUIZ 2: Spring Boot 3 & Microservices (Questions 11 to 20)
-- -------------------------------------------------------------
INSERT INTO questions (id, quiz_id, question_text, question_type, marks, explanation, order_index) VALUES
(11, 2, 'In Spring Boot 3, which Jakarta EE namespace replaced `javax.*` packages?', 'SINGLE', 1.00, 'Spring Boot 3 migrated to Jakarta EE 9/10 baseline, replacing javax.* imports with jakarta.*.', 1),
(12, 2, 'What is the default bean scope in Spring Framework ApplicationContext?', 'SINGLE', 1.00, 'Singleton is the default scope; only one shared instance of the bean definition is created per Spring IoC container.', 2),
(13, 2, 'Which HTTP status code is recommended for a RESTful resource creation endpoint?', 'SINGLE', 1.00, 'HTTP 201 Created should be returned with a Location header pointing to the newly created entity URI.', 3),
(14, 2, 'Which annotations are essential for defining a Spring Data JPA Repository?', 'MULTI', 2.00, '@Repository is the Spring stereotype, though extending JpaRepository automatically enables Spring Data proxy mechanisms.', 4),
(15, 2, 'What does `@Transactional(readOnly = true)` provide in Hibernate / JPA?', 'SINGLE', 1.00, 'It optimizes JDBC driver performance and allows Hibernate to disable dirty checking during session flush, saving CPU and memory.', 5),
(16, 2, 'How does JWT (JSON Web Token) achieve stateless authentication?', 'SINGLE', 1.00, 'The server cryptographically signs the claims in the token with a secret key; the client holds the token and passes it in the Authorization header.', 6),
(17, 2, 'Which method is used in Spring Security 6 to define the security filter chain bean?', 'SINGLE', 1.00, 'In Spring Security 6+, the SecurityFilterChain bean is configured returning `http.build()` using lambda DSL instead of deprecated WebSecurityConfigurerAdapter.', 7),
(18, 2, 'What is the purpose of Spring Boot Actuator?', 'SINGLE', 1.00, 'Actuator provides production-ready features such as health checks, metrics, auditing, environment information, and thread dumps.', 8),
(19, 2, 'Which mechanisms prevent N+1 select queries in Spring Data JPA? (Select all that apply)', 'MULTI', 2.00, 'Using JOIN FETCH in JPQL queries and @EntityGraph are the two most standard solutions to prevent N+1 queries.', 9),
(20, 2, 'What is the difference between `@Controller` and `@RestController` in Spring MVC?', 'SINGLE', 1.00, '@RestController is a convenience meta-annotation combining @Controller and @ResponseBody, causing returned objects to be serialized directly into JSON/XML.', 10);

-- Options for Quiz 2
INSERT INTO question_options (question_id, option_text, is_correct, order_index) VALUES
-- Q11
(11, 'jakarta.*', TRUE, 1),
(12, 'oracle.jee.*', FALSE, 2),
(11, 'apache.geronimo.*', FALSE, 3),
(11, 'eclipse.microprofile.*', FALSE, 4),
-- Q12
(12, 'singleton', TRUE, 1),
(12, 'prototype', FALSE, 2),
(12, 'request', FALSE, 3),
(12, 'session', FALSE, 4),
-- Q13
(13, '201 Created', TRUE, 1),
(13, '200 OK', FALSE, 2),
(13, '202 Accepted', FALSE, 3),
(13, '204 No Content', FALSE, 4),
-- Q14 (MULTI)
(14, 'Extending JpaRepository<T, ID>', TRUE, 1),
(14, '@Repository stereotype annotation', TRUE, 2),
(14, '@Entity annotation on repository interface', FALSE, 3),
(14, '@Autowired on the interface definition', FALSE, 4),
-- Q15
(15, 'Disables Hibernate snapshot dirty checking and optimizes query flushing', TRUE, 1),
(15, 'Prevents database connection pooling', FALSE, 2),
(15, 'Enforces write locks on every read table', FALSE, 3),
(15, 'Converts all SQL queries into asynchronous reactive streams', FALSE, 4),
-- Q16
(16, 'Server verifies signature with its secret key without querying session storage', TRUE, 1),
(16, 'Tokens are stored in server RAM and looked up by key on every request', FALSE, 2),
(16, 'The client encrypts the database password inside the cookie', FALSE, 3),
(16, 'The browser handles authentication natively using hardware TPM', FALSE, 4),
-- Q17
(17, 'public SecurityFilterChain filterChain(HttpSecurity http) throws Exception', TRUE, 1),
(17, 'extends WebSecurityConfigurerAdapter', FALSE, 2),
(17, 'public void configure(AuthenticationManagerBuilder auth)', FALSE, 3),
(17, 'public JwtTokenFilter initializeFilter()', FALSE, 4),
-- Q18
(18, 'Provides health checks, metrics, thread dumps, and monitoring endpoints', TRUE, 1),
(18, 'Automatically creates database migrations and backups', FALSE, 2),
(18, 'Generates frontend React components from Spring entities', FALSE, 3),
(18, 'Serves as an in-memory Redis cache replacement', FALSE, 4),
-- Q19 (MULTI)
(19, 'Using "JOIN FETCH" in custom JPQL / HQL queries', TRUE, 1),
(19, 'Specifying @EntityGraph on repository query methods', TRUE, 2),
(19, 'Using FetchType.EAGER on all relations', FALSE, 3),
(19, 'Setting spring.jpa.show-sql=true in application.properties', FALSE, 4),
-- Q20
(20, '@RestController combines @Controller and @ResponseBody automatically', TRUE, 1),
(20, '@RestController is only for SOAP web services', FALSE, 2),
(20, '@Controller automatically returns JSON by default', FALSE, 3),
(20, 'There is no difference; they are aliases for the same class', FALSE, 4);

-- -------------------------------------------------------------
-- QUIZ 3: MySQL & Relational DBs (Questions 21 to 30)
-- -------------------------------------------------------------
INSERT INTO questions (id, quiz_id, question_text, question_type, marks, explanation, order_index) VALUES
(21, 3, 'Which storage engine is the default in MySQL 8.0 with full ACID support?', 'SINGLE', 1.00, 'InnoDB is the default transaction-safe (ACID compliant) storage engine for MySQL.', 1),
(22, 3, 'What type of data structure does MySQL InnoDB use for primary key clustered indexes?', 'SINGLE', 1.00, 'InnoDB uses B+Tree structures where leaf nodes store complete row data for clustered indexes.', 2),
(23, 3, 'Which of the following are ACID properties in relational database transactions? (Select all that apply)', 'MULTI', 2.00, 'ACID stands for Atomicity, Consistency, Isolation, Durability.', 3),
(24, 3, 'What is the default transaction isolation level in MySQL InnoDB?', 'SINGLE', 1.00, 'REPEATABLE READ is InnoDB default isolation level, using MVCC and Next-Key Locks to avoid phantom reads.', 4),
(25, 3, 'In an EXPLAIN query plan, which "type" indicates the worst possible query performance?', 'SINGLE', 1.00, 'type "ALL" indicates a Full Table Scan where MySQL reads every single row in the table.', 5),
(26, 3, 'What does the Leftmost Prefix Rule dictate for composite indexes (e.g. INDEX(a, b, c))?', 'SINGLE', 1.00, 'The query must filter on columns starting from the leftmost column "a" for the index to be utilized.', 6),
(27, 3, 'Which phenomenon is prevented by READ COMMITTED that occurs in READ UNCOMMITTED?', 'SINGLE', 1.00, 'Dirty Read occurs when a transaction reads uncommitted changes from another transaction.', 7),
(28, 3, 'What is the difference between `CHAR` and `VARCHAR` in MySQL?', 'SINGLE', 1.00, 'CHAR has a fixed length padded with spaces, whereas VARCHAR allocates variable length with byte prefix.', 8),
(29, 3, 'Which SQL clauses are evaluated BEFORE the SELECT clause in logical query processing? (Select all that apply)', 'MULTI', 2.00, 'Logical processing order: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> DISTINCT -> ORDER BY -> LIMIT.', 9),
(30, 3, 'What is a Foreign Key constraint with ON DELETE CASCADE?', 'SINGLE', 1.00, 'When a row in the parent table is deleted, all referencing rows in the child table are automatically deleted.', 10);

-- Options for Quiz 3
INSERT INTO question_options (question_id, option_text, is_correct, order_index) VALUES
-- Q21
(21, 'InnoDB', TRUE, 1),
(21, 'MyISAM', FALSE, 2),
(21, 'Memory', FALSE, 3),
(21, 'CSV', FALSE, 4),
-- Q22
(22, 'B+Tree', TRUE, 1),
(22, 'Red-Black Tree', FALSE, 2),
(22, 'Hash Table', FALSE, 3),
(22, 'Skip List', FALSE, 4),
-- Q23 (MULTI)
(23, 'Atomicity', TRUE, 1),
(23, 'Consistency', TRUE, 2),
(23, 'Durability', TRUE, 3),
(23, 'Availability', FALSE, 4),
-- Q24
(24, 'REPEATABLE READ', TRUE, 1),
(24, 'READ COMMITTED', FALSE, 2),
(24, 'SERIALIZABLE', FALSE, 3),
(24, 'READ UNCOMMITTED', FALSE, 4),
-- Q25
(25, 'ALL (Full Table Scan)', TRUE, 1),
(25, 'ref', FALSE, 2),
(25, 'range', FALSE, 3),
(25, 'const', FALSE, 4),
-- Q26
(26, 'The query must match columns starting from the leftmost index column', TRUE, 1),
(26, 'The query can use any subset of columns in any random order', FALSE, 2),
(26, 'The index is only used if all columns have the exact same length', FALSE, 3),
(26, 'The index is only used for sorting with ORDER BY DESC', FALSE, 4),
-- Q27
(27, 'Dirty Read', TRUE, 1),
(27, 'Non-repeatable Read', FALSE, 2),
(27, 'Phantom Read', FALSE, 3),
(27, 'Deadlock', FALSE, 4),
-- Q28
(28, 'CHAR is fixed-length; VARCHAR is variable-length', TRUE, 1),
(28, 'VARCHAR cannot store unicode characters', FALSE, 2),
(28, 'CHAR uses more memory on modern SSDs than BLOB', FALSE, 3),
(28, 'There is no difference in MySQL 8', FALSE, 4),
-- Q29 (MULTI)
(29, 'WHERE', TRUE, 1),
(29, 'GROUP BY', TRUE, 2),
(29, 'HAVING', TRUE, 3),
(29, 'ORDER BY', FALSE, 4),
-- Q30
(30, 'Child records are automatically deleted when the parent record is deleted', TRUE, 1),
(30, 'Deletions in parent table are blocked if child records exist', FALSE, 2),
(30, 'Child foreign key values are set to NULL', FALSE, 3),
(30, 'Parent record is soft-deleted by setting deleted_at timestamp', FALSE, 4);

-- -------------------------------------------------------------
-- QUIZ 4: Docker & Cloud DevOps (Questions 31 to 40)
-- -------------------------------------------------------------
INSERT INTO questions (id, quiz_id, question_text, question_type, marks, explanation, order_index) VALUES
(31, 4, 'What is the smallest deployable computing unit in Kubernetes?', 'SINGLE', 1.00, 'A Pod is the smallest execution unit in Kubernetes, encapsulating one or more containers sharing network and storage.', 1),
(32, 4, 'In a multi-stage Dockerfile, what is the main benefit of intermediate builder stages?', 'SINGLE', 1.00, 'Multi-stage builds leave compiler toolchains, SDKs, and build artifacts behind, producing lean, lightweight production images.', 2),
(33, 4, 'Which Kubernetes object provides declarative updates for Pods and ReplicaSets?', 'SINGLE', 1.00, 'A Deployment provides declarative updates for Pods and manages rollouts and rollbacks.', 3),
(34, 4, 'Which Docker commands are used to inspect running container logs and health? (Select all that apply)', 'MULTI', 2.00, '`docker logs` outputs container stdout/stderr; `docker inspect` gives detailed JSON metadata including health checks.', 4),
(35, 4, 'What is the difference between CMD and ENTRYPOINT in a Dockerfile?', 'SINGLE', 1.00, 'ENTRYPOINT sets the default executable, while CMD provides default parameters that can be overridden easily by CLI args.', 5),
(36, 4, 'What kind of Kubernetes Service exposes the service on an external IP outside the cluster?', 'SINGLE', 1.00, 'LoadBalancer service provisions an external cloud load balancer to direct traffic into the cluster.', 6),
(37, 4, 'What is the function of a Kubernetes Ingress Controller?', 'SINGLE', 1.00, 'Ingress acts as an HTTP/HTTPS reverse proxy and router, routing host/path requests to internal cluster Services.', 7),
(38, 4, 'Which principles are key to Infrastructure as Code (IaC)? (Select all that apply)', 'MULTI', 2.00, 'IaC emphasizes version-controlled definitions, reproducibility, and declarative configuration.', 8),
(39, 4, 'In CI/CD, what is the difference between Continuous Delivery and Continuous Deployment?', 'SINGLE', 1.00, 'Continuous Delivery requires manual approval before deploying to production; Continuous Deployment deploys automatically.', 9),
(40, 4, 'What happens when a Kubernetes Pod exceeds its memory limit configured in resources?', 'SINGLE', 1.00, 'The Linux kernel OOM (Out Of Memory) killer terminates the container, and Kubernetes restarts it with OOMKilled status.', 10);

-- Options for Quiz 4
INSERT INTO question_options (question_id, option_text, is_correct, order_index) VALUES
-- Q31
(31, 'Pod', TRUE, 1),
(31, 'Container', FALSE, 2),
(31, 'Deployment', FALSE, 3),
(31, 'Service', FALSE, 4),
-- Q32
(32, 'Drastically reduces the final image size and minimizes security attack surface', TRUE, 1),
(32, 'Speeds up CPU clock frequencies inside the container', FALSE, 2),
(32, 'Allows Docker to run without a daemon process', FALSE, 3),
(32, 'Automatically connects the container to Kubernetes API', FALSE, 4),
-- Q33
(33, 'Deployment', TRUE, 1),
(33, 'ConfigMap', FALSE, 2),
(33, 'DaemonSet', FALSE, 3),
(33, 'StatefulSet', FALSE, 4),
-- Q34 (MULTI)
(34, 'docker logs <container_id>', TRUE, 1),
(34, 'docker inspect <container_id>', TRUE, 2),
(34, 'docker format --all', FALSE, 3),
(34, 'docker compile <container_id>', FALSE, 4),
-- Q35
(35, 'ENTRYPOINT specifies the executable, CMD defines default arguments that can be overridden', TRUE, 1),
(35, 'CMD is executed on build time; ENTRYPOINT is executed on run time', FALSE, 2),
(35, 'CMD is only valid for Windows containers', FALSE, 3),
(35, 'There is no difference; they are identical aliases', FALSE, 4),
-- Q36
(36, 'LoadBalancer', TRUE, 1),
(36, 'ClusterIP', FALSE, 2),
(36, 'NodePort', FALSE, 3),
(36, 'ExternalName', FALSE, 4),
-- Q37
(37, 'Routes external HTTP/HTTPS traffic to cluster services using host/path rules', TRUE, 1),
(37, 'Manages physical hardware network switches', FALSE, 2),
(37, 'Replaces DNS resolution for Docker container runtimes', FALSE, 3),
(37, 'Backs up etcd database every 10 minutes', FALSE, 4),
-- Q38 (MULTI)
(38, 'Version control of infrastructure definitions via Git', TRUE, 1),
(38, 'Repeatable and idempotent environment provisioning', TRUE, 2),
(38, 'Declarative desired state specification', TRUE, 3),
(38, 'Manual server configuration via interactive SSH', FALSE, 4),
-- Q39
(39, 'Continuous Delivery requires manual approval for production; Continuous Deployment deploys automatically', TRUE, 1),
(39, 'Continuous Delivery does not run automated tests', FALSE, 2),
(39, 'Continuous Deployment is only for mobile applications', FALSE, 3),
(39, 'Continuous Delivery only builds Docker images without push', FALSE, 4),
-- Q40
(40, 'The container is killed by OOMKiller and marked OOMKilled', TRUE, 1),
(40, 'Kubernetes allocates virtual swap memory from host disk', FALSE, 2),
(40, 'The CPU frequency is throttled by 50%', FALSE, 3),
(40, 'The node shuts down immediately', FALSE, 4);

-- -------------------------------------------------------------
-- QUIZ 5: Data Structures & Algorithms (Questions 41 to 50)
-- -------------------------------------------------------------
INSERT INTO questions (id, quiz_id, question_text, question_type, marks, explanation, order_index) VALUES
(41, 5, 'What is the average time complexity of searching in a balanced Binary Search Tree (AVL / Red-Black)?', 'SINGLE', 1.00, 'Balanced BSTs maintain height O(log n), ensuring lookup, insertion, and deletion take O(log n).', 1),
(42, 5, 'Which sorting algorithm has a guaranteed worst-case time complexity of O(n log n)?', 'SINGLE', 1.00, 'Merge Sort guarantees O(n log n) in best, average, and worst cases through divide-and-conquer.', 2),
(43, 5, 'Which graph algorithm finds the shortest path in a weighted graph with non-negative edge weights?', 'SINGLE', 1.00, 'Dijkstra algorithm uses a priority queue to compute shortest paths with non-negative edges in O((V + E) log V).', 3),
(44, 5, 'What are the two core properties that indicate a problem can be solved using Dynamic Programming? (Select two)', 'MULTI', 2.00, 'Dynamic Programming is applicable when a problem exhibits Overlapping Subproblems and Optimal Substructure.', 4),
(45, 5, 'What is the worst-case time complexity of Hash Table lookup with separate chaining collision resolution?', 'SINGLE', 1.00, 'If all keys hash to the exact same bucket, the bucket becomes a linked list of size n, giving O(n) worst-case search.', 5),
(46, 5, 'Which traversal of a Binary Search Tree produces elements in sorted ascending order?', 'SINGLE', 1.00, 'In-order traversal visits (Left, Root, Right), which outputs keys in strictly sorted order in a BST.', 6),
(47, 5, 'What is the space complexity of an iterative Breadth-First Search (BFS) on a tree with branching factor b and depth d?', 'SINGLE', 1.00, 'In the worst case, the queue in BFS holds all nodes at the bottom level, which is O(b^d).', 7),
(48, 5, 'Which data structure is primarily used to implement LRU (Least Recently Used) Cache with O(1) operations?', 'SINGLE', 1.00, 'A Doubly Linked List combined with a Hash Map allows O(1) node lookup and O(1) removal/insertion at the head/tail.', 8),
(49, 5, 'Which algorithms can be used to detect a cycle in a directed graph? (Select all that apply)', 'MULTI', 2.00, 'Depth-First Search (using recursion stack / 3-color marking) and Kahn Algorithm (topological sort indegree) detect cycles.', 9),
(50, 5, 'What is the time complexity of building a Binary Heap from an arbitrary array of n elements?', 'SINGLE', 1.00, 'Heapify algorithm builds a heap in linear O(n) time, mathematically bounded by the sum of heights.', 10);

-- Options for Quiz 5
INSERT INTO question_options (question_id, option_text, is_correct, order_index) VALUES
-- Q41
(41, 'O(log n)', TRUE, 1),
(41, 'O(1)', FALSE, 2),
(41, 'O(n)', FALSE, 3),
(41, 'O(n log n)', FALSE, 4),
-- Q42
(42, 'Merge Sort', TRUE, 1),
(42, 'Quick Sort', FALSE, 2),
(42, 'Bubble Sort', FALSE, 3),
(42, 'Insertion Sort', FALSE, 4),
-- Q43
(43, 'Dijkstra Algorithm', TRUE, 1),
(43, 'Kruskal Algorithm', FALSE, 2),
(43, 'Prim Algorithm', FALSE, 3),
(43, 'Floyd-Warshall (all-pairs only)', FALSE, 4),
-- Q44 (MULTI)
(44, 'Optimal Substructure', TRUE, 1),
(44, 'Overlapping Subproblems', TRUE, 2),
(44, 'Greedy Choice Property', FALSE, 3),
(44, 'Monotonic Stack Property', FALSE, 4),
-- Q45
(45, 'O(n)', TRUE, 1),
(45, 'O(1)', FALSE, 2),
(45, 'O(log n)', FALSE, 3),
(45, 'O(n^2)', FALSE, 4),
-- Q46
(46, 'In-order Traversal', TRUE, 1),
(46, 'Pre-order Traversal', FALSE, 2),
(46, 'Post-order Traversal', FALSE, 3),
(46, 'Level-order Traversal', FALSE, 4),
-- Q47
(47, 'O(b^d)', TRUE, 1),
(47, 'O(d)', FALSE, 2),
(47, 'O(1)', FALSE, 3),
(47, 'O(log d)', FALSE, 4),
-- Q48
(48, 'Hash Map + Doubly Linked List', TRUE, 1),
(48, 'Binary Max Heap + Stack', FALSE, 2),
(48, 'Trie + Array', FALSE, 3),
(48, 'Circular Queue only', FALSE, 4),
-- Q49 (MULTI)
(49, 'Depth-First Search (DFS) with recursion stack state', TRUE, 1),
(49, 'Kahn Algorithm (Topological Sort BFS)', TRUE, 2),
(49, 'Dijkstra Shortest Path', FALSE, 3),
(49, 'Binary Search on Edges', FALSE, 4),
-- Q50
(50, 'O(n)', TRUE, 1),
(50, 'O(n log n)', FALSE, 2),
(50, 'O(log n)', FALSE, 3),
(50, 'O(n^2)', FALSE, 4);

-- 7. BADGES
INSERT INTO badges (id, code, title, description, icon_name, category, xp_reward) VALUES
(1, 'FIRST_QUIZ', 'Quick Starter', 'Completed your very first quiz on QuizTrack.', 'Award', 'GENERAL', 50),
(2, 'STREAK_5', 'Dedicated Learner', 'Maintained a 5-day quiz learning streak.', 'Flame', 'STREAK', 150),
(3, 'PERFECT_SCORE', 'Centurion', 'Scored a flawless 100% on any published quiz.', 'Zap', 'MASTERY', 300),
(4, 'SPEED_DEMON', 'Speed Demon', 'Completed a quiz in less than 5 minutes with score >= 80%.', 'Timer', 'SPEED', 200),
(5, 'JAVA_CHAMPION', 'Java Champion', 'Passed the Spring Boot & Microservices assessment.', 'Coffee', 'DOMAIN', 250),
(6, 'SQL_PRO', 'Query Master', 'Achieved over 80% on Database & SQL Systems.', 'Database', 'DOMAIN', 200);

-- 8. USER BADGES
INSERT INTO user_badges (user_id, badge_id, earned_at) VALUES
(2, 1, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 2, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 6, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 1, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(4, 1, DATE_SUB(NOW(), INTERVAL 10 DAY)),
(4, 2, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(4, 3, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(4, 5, DATE_SUB(NOW(), INTERVAL 3 DAY));

-- 9. HISTORICAL ATTEMPTS (For rich analytics, score trend line, radar charts)
INSERT INTO attempts (id, user_id, quiz_id, status, started_at, completed_at, total_time_seconds, score_obtained, total_marks, percentage, is_passed, correct_count, wrong_count, skipped_count, total_questions, violation_count, certificate_code, xp_awarded, created_at) VALUES
-- Alice attempts
(1, 2, 1, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 480 SECOND, 480, 8.50, 11.00, 77.27, TRUE, 8, 2, 0, 10, 0, 'QT-CERT-ALICE-1001', 120, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 2, 3, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 410 SECOND, 410, 9.25, 11.00, 84.09, TRUE, 9, 1, 0, 10, 0, 'QT-CERT-ALICE-1002', 150, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 2, 2, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 620 SECOND, 620, 7.00, 11.00, 63.64, FALSE, 7, 3, 0, 10, 1, NULL, 60, DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- Bob attempts
(4, 3, 4, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 750 SECOND, 750, 8.00, 11.00, 72.73, TRUE, 8, 2, 0, 10, 0, 'QT-CERT-BOB-2001', 130, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(5, 3, 1, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 520 SECOND, 520, 6.00, 11.00, 54.55, FALSE, 6, 4, 0, 10, 0, NULL, 50, DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- Charlie attempts (High achiever)
(6, 4, 1, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY) + INTERVAL 380 SECOND, 380, 11.00, 11.00, 100.00, TRUE, 10, 0, 0, 10, 0, 'QT-CERT-CHARLIE-3001', 250, DATE_SUB(NOW(), INTERVAL 9 DAY)),
(7, 4, 2, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY) + INTERVAL 490 SECOND, 490, 10.00, 11.00, 90.91, TRUE, 9, 1, 0, 10, 0, 'QT-CERT-CHARLIE-3002', 200, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(8, 4, 3, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY) + INTERVAL 340 SECOND, 340, 10.25, 11.00, 93.18, TRUE, 9, 1, 0, 10, 0, 'QT-CERT-CHARLIE-3003', 210, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(9, 4, 5, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 690 SECOND, 690, 9.00, 11.00, 81.82, TRUE, 8, 2, 0, 10, 0, 'QT-CERT-CHARLIE-3004', 190, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- 10. ACTIVITY LOG
INSERT INTO activity_log (user_id, action_type, description, created_at) VALUES
(2, 'LOGIN', 'Logged into QuizTrack dashboard', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 'QUIZ_COMPLETED', 'Completed quiz "Full-Stack JavaScript & React Mastery" with 77.27%', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 'BADGE_EARNED', 'Earned badge: Quick Starter', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 'QUIZ_COMPLETED', 'Completed quiz "MySQL & High-Performance Relational DBs" with 84.09%', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 'BADGE_EARNED', 'Earned badge: Query Master', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(4, 'QUIZ_COMPLETED', 'Achieved 100% on "Full-Stack JavaScript & React Mastery"', DATE_SUB(NOW(), INTERVAL 9 DAY)),
(4, 'BADGE_EARNED', 'Earned badge: Centurion', DATE_SUB(NOW(), INTERVAL 9 DAY)),
(4, 'QUIZ_COMPLETED', 'Completed quiz "Advanced Data Structures & Algorithms" with 81.82%', DATE_SUB(NOW(), INTERVAL 1 DAY));
