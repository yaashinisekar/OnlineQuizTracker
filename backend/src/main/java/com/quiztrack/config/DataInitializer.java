package com.quiztrack.config;

import com.quiztrack.entity.*;
import com.quiztrack.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final OptionRepository optionRepository;
    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final AttemptRepository attemptRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Initializing QuizTrack master and seed data...");

        // 1. Roles
        Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
            .orElseGet(() -> roleRepository.save(Role.builder()
                .name(RoleName.ROLE_ADMIN)
                .description("System Administrator")
                .build()));

        Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
            .orElseGet(() -> roleRepository.save(Role.builder()
                .name(RoleName.ROLE_USER)
                .description("Standard Candidate User")
                .build()));

        // 2. Badges
        createBadgeIfAbsent("FIRST_QUIZ", "Quick Starter", "Completed your very first quiz on QuizTrack.", "Award", "GENERAL", 50);
        createBadgeIfAbsent("STREAK_5", "Dedicated Learner", "Maintained a 5-day quiz learning streak.", "Flame", "STREAK", 150);
        createBadgeIfAbsent("PERFECT_SCORE", "Centurion", "Scored a flawless 100% on any published quiz.", "Zap", "MASTERY", 300);
        createBadgeIfAbsent("SPEED_DEMON", "Speed Demon", "Completed a quiz in less than 5 minutes with score >= 80%.", "Timer", "SPEED", 200);
        createBadgeIfAbsent("JAVA_CHAMPION", "Java Champion", "Passed the Spring Boot & Microservices assessment.", "Coffee", "DOMAIN", 250);
        createBadgeIfAbsent("SQL_PRO", "Query Master", "Achieved over 80% on Database & SQL Systems.", "Database", "DOMAIN", 200);

        // 3. Admin User
        User adminUser = userRepository.findByEmail("admin@quiztrack.io").orElseGet(() -> {
            User admin = User.builder()
                .email("admin@quiztrack.io")
                .passwordHash(passwordEncoder.encode("Admin@123"))
                .firstName("Sarah")
                .lastName("Connor")
                .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80")
                .bio("Lead Platform Architect & Administrator at QuizTrack.")
                .isActive(true)
                .isBlocked(false)
                .xpPoints(3500)
                .currentLevel(8)
                .currentStreak(14)
                .longestStreak(21)
                .lastActiveDate(LocalDate.now())
                .roles(new HashSet<>(Arrays.asList(adminRole, userRole)))
                .build();
            return userRepository.save(admin);
        });

        // Ensure valid BCrypt passwords for existing demo accounts
        userRepository.findByEmail("admin@quiztrack.io").ifPresent(u -> {
            u.setPasswordHash(passwordEncoder.encode("Admin@123"));
            userRepository.save(u);
        });
        userRepository.findByEmail("alice@quiztrack.io").ifPresent(u -> {
            u.setPasswordHash(passwordEncoder.encode("User@123"));
            userRepository.save(u);
        });
        userRepository.findByEmail("bob@quiztrack.io").ifPresent(u -> {
            u.setPasswordHash(passwordEncoder.encode("User@123"));
            userRepository.save(u);
        });
        userRepository.findByEmail("charlie@quiztrack.io").ifPresent(u -> {
            u.setPasswordHash(passwordEncoder.encode("User@123"));
            userRepository.save(u);
        });

        // 5. Seed Quizzes & Categories if empty
        if (quizRepository.count() == 0) {
            log.info("Seeding categories and quizzes...");
            seedCategoriesAndQuizzes(adminUser);
        }

        log.info("QuizTrack database initialization completed successfully.");
    }

    private void createBadgeIfAbsent(String code, String title, String description, String icon, String cat, int xp) {
        if (badgeRepository.findByCode(code).isEmpty()) {
            badgeRepository.save(Badge.builder()
                .code(code)
                .title(title)
                .description(description)
                .iconName(icon)
                .category(cat)
                .xpReward(xp)
                .build());
        }
    }

    private User createUserIfAbsent(String email, String rawPassword, String fn, String ln, int xp, int level, int streak, int maxStreak, String avatar, String bio, Role role) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .firstName(fn)
                .lastName(ln)
                .avatarUrl(avatar)
                .bio(bio)
                .isActive(true)
                .isBlocked(false)
                .xpPoints(xp)
                .currentLevel(level)
                .currentStreak(streak)
                .longestStreak(maxStreak)
                .lastActiveDate(LocalDate.now())
                .roles(Collections.singleton(role))
                .build();
            return userRepository.save(user);
        });
    }

    private void seedCategoriesAndQuizzes(User admin) {
        Category webDev = categoryRepository.save(Category.builder()
            .name("Web Development & JavaScript")
            .slug("web-development")
            .description("Modern React, ESNext, TypeScript, DOM and Web performance.")
            .iconName("Code2")
            .colorCode("#3B82F6")
            .build());

        Category javaSpring = categoryRepository.save(Category.builder()
            .name("Java & Spring Framework")
            .slug("java-spring")
            .description("Core Java concurrency, Spring Boot 3, Spring Security & JPA patterns.")
            .iconName("Coffee")
            .colorCode("#10B981")
            .build());

        Category databaseSql = categoryRepository.save(Category.builder()
            .name("Database & SQL Systems")
            .slug("database-sql")
            .description("Relational design, indexing, transactions, ACID, and query optimization.")
            .iconName("Database")
            .colorCode("#8B5CF6")
            .build());

        Category cloudDevOps = categoryRepository.save(Category.builder()
            .name("Cloud Computing & DevOps")
            .slug("cloud-devops")
            .description("Docker containers, Kubernetes orchestration, CI/CD, and AWS architecture.")
            .iconName("Cloud")
            .colorCode("#F59E0B")
            .build());

        Category dsa = categoryRepository.save(Category.builder()
            .name("Data Structures & Algorithms")
            .slug("dsa-algorithms")
            .description("Algorithm analysis, dynamic programming, trees, graphs, and system design.")
            .iconName("Cpu")
            .colorCode("#EC4899")
            .build());

        // Quiz 1
        Quiz q1 = quizRepository.save(Quiz.builder()
            .category(webDev)
            .createdByUser(admin)
            .title("Full-Stack JavaScript & React Mastery")
            .slug("react-javascript-mastery")
            .description("Test your skills in modern JavaScript (ES6+), React hooks, virtual DOM reconciler, and state management.")
            .difficulty(Difficulty.MEDIUM)
            .durationMinutes(15)
            .passPercentage(new BigDecimal("70.00"))
            .negativeMarking(true)
            .negativeMarkingDeduction(new BigDecimal("0.25"))
            .perQuestionTimerSeconds(60)
            .isPublished(true)
            .shuffleQuestions(true)
            .shuffleOptions(true)
            .maxViolationsAllowed(3)
            .build());

        addQuestion(q1, "What is the primary difference between useEffect and useLayoutEffect in React?", QuestionType.SINGLE, new BigDecimal("1.00"),
            "useEffect runs asynchronously after browser paint, whereas useLayoutEffect runs synchronously before browser paint.", 1,
            List.of(
                new OptionSeed("useLayoutEffect runs synchronously before browser paint; useEffect runs asynchronously after paint.", true),
                new OptionSeed("useEffect runs before DOM updates; useLayoutEffect runs after server rendering.", false),
                new OptionSeed("There is no difference; useLayoutEffect is simply deprecated.", false),
                new OptionSeed("useEffect runs on the server while useLayoutEffect runs exclusively on web workers.", false)
            ));

        addQuestion(q1, "Which of the following statements about JavaScript closures are TRUE? (Select all that apply)", QuestionType.MULTI, new BigDecimal("2.00"),
            "A closure gives an inner function access to its outer enclosing scope and can help encapsulate private state.", 2,
            List.of(
                new OptionSeed("A closure gives an inner function access to its outer enclosing scope.", true),
                new OptionSeed("Closures can help encapsulate private variables in modules.", true),
                new OptionSeed("Variables captured in closures are garbage collected immediately upon function return.", false),
                new OptionSeed("Closures only work when declared using the arrow function syntax.", false)
            ));

        addQuestion(q1, "What will `console.log(typeof NaN)` output in standard ECMAScript?", QuestionType.SINGLE, new BigDecimal("1.00"),
            "In JavaScript, NaN (Not-a-Number) is mathematically a number type representing an unrepresentable value.", 3,
            List.of(
                new OptionSeed("number", true),
                new OptionSeed("nan", false),
                new OptionSeed("undefined", false),
                new OptionSeed("object", false)
            ));

        addQuestion(q1, "How does React Virtual DOM reconciliation identify elements across renders?", QuestionType.SINGLE, new BigDecimal("1.00"),
            "React uses unique key props among siblings to match children between renders efficiently.", 4,
            List.of(
                new OptionSeed("The 'key' prop assigned to sibling elements", true),
                new OptionSeed("The HTML id attribute", false),
                new OptionSeed("The memory address of the component instance", false),
                new OptionSeed("The index in the global React fiber stack", false)
            ));

        addQuestion(q1, "Which array methods mutate the original array in place in JavaScript? (Select all that apply)", QuestionType.MULTI, new BigDecimal("2.00"),
            "splice() and sort() mutate the original array, whereas map() and filter() return a new copy.", 5,
            List.of(
                new OptionSeed("Array.prototype.splice()", true),
                new OptionSeed("Array.prototype.sort()", true),
                new OptionSeed("Array.prototype.map()", false),
                new OptionSeed("Array.prototype.filter()", false)
            ));

        addQuestion(q1, "What is the purpose of React.memo()?", QuestionType.SINGLE, new BigDecimal("1.00"),
            "React.memo prevents component re-rendering if its props are shallowly unchanged.", 6,
            List.of(
                new OptionSeed("Prevents component re-rendering if props are shallowly equal", true),
                new OptionSeed("Caches asynchronous API network responses", false),
                new OptionSeed("Stores component state into browser localStorage automatically", false),
                new OptionSeed("Binds event handlers to the React fiber root", false)
            ));

        addQuestion(q1, "What is the output of `[1, 2, 3] + [4, 5, 6]` in JavaScript?", QuestionType.SINGLE, new BigDecimal("1.00"),
            "Arrays are converted to strings and concatenated as '1,2,34,5,6'.", 7,
            List.of(
                new OptionSeed("\"1,2,34,5,6\"", true),
                new OptionSeed("[1, 2, 3, 4, 5, 6]", false),
                new OptionSeed("TypeError: cannot concatenate arrays", false),
                new OptionSeed("NaN", false)
            ));

        addQuestion(q1, "Which hook should you use to store a mutable value that does NOT trigger a re-render when modified?", QuestionType.SINGLE, new BigDecimal("1.00"),
            "useRef returns a mutable ref object without triggering re-render on mutation.", 8,
            List.of(
                new OptionSeed("useRef", true),
                new OptionSeed("useState", false),
                new OptionSeed("useMemo", false),
                new OptionSeed("useCallback", false)
            ));

        addQuestion(q1, "What does the JavaScript Event Loop do when the Call Stack is empty?", QuestionType.SINGLE, new BigDecimal("1.00"),
            "It executes all pending microtasks (Promises) before picking the next macrotask.", 9,
            List.of(
                new OptionSeed("Executes all pending microtasks before taking the next macrotask", true),
                new OptionSeed("Executes macrotasks first, followed by microtasks", false),
                new OptionSeed("Shuts down the Node.js runtime or browser thread", false),
                new OptionSeed("Immediately renders CSS animations regardless of queue state", false)
            ));

        addQuestion(q1, "What happens if you update state inside a React useEffect without a dependency array?", QuestionType.SINGLE, new BigDecimal("1.00"),
            "Without dependencies, useEffect runs after every render, resulting in an infinite render cycle.", 10,
            List.of(
                new OptionSeed("An infinite re-render loop occurs", true),
                new OptionSeed("React throws a CompileTimeException", false),
                new OptionSeed("The effect is completely ignored by React", false),
                new OptionSeed("The state update will be batched only once per session", false)
            ));

        // Quiz 2
        Quiz q2 = quizRepository.save(Quiz.builder()
            .category(javaSpring)
            .createdByUser(admin)
            .title("Spring Boot 3 & Microservices Architecture")
            .slug("spring-boot-microservices")
            .description("Deep dive into Spring Framework 6, dependency injection, Spring Security 6 JWT, and distributed transactions.")
            .difficulty(Difficulty.MEDIUM)
            .durationMinutes(20)
            .passPercentage(new BigDecimal("65.00"))
            .negativeMarking(false)
            .negativeMarkingDeduction(BigDecimal.ZERO)
            .perQuestionTimerSeconds(0)
            .isPublished(true)
            .shuffleQuestions(true)
            .shuffleOptions(true)
            .maxViolationsAllowed(3)
            .build());

        addQuestion(q2, "In Spring Boot 3, which Jakarta EE namespace replaced `javax.*` packages?", QuestionType.SINGLE, new BigDecimal("1.00"),
            "Spring Boot 3 upgraded to Jakarta EE 9/10 baseline, requiring jakarta.* imports.", 1,
            List.of(
                new OptionSeed("jakarta.*", true),
                new OptionSeed("oracle.jee.*", false),
                new OptionSeed("apache.geronimo.*", false),
                new OptionSeed("eclipse.microprofile.*", false)
            ));

        addQuestion(q2, "What is the default bean scope in Spring Framework ApplicationContext?", QuestionType.SINGLE, new BigDecimal("1.00"),
            "Singleton is the default bean scope in Spring.", 2,
            List.of(
                new OptionSeed("singleton", true),
                new OptionSeed("prototype", false),
                new OptionSeed("request", false),
                new OptionSeed("session", false)
            ));

        addQuestion(q2, "Which HTTP status code is recommended for a RESTful resource creation endpoint?", QuestionType.SINGLE, new BigDecimal("1.00"),
            "HTTP 201 Created indicates successful resource creation.", 3,
            List.of(
                new OptionSeed("201 Created", true),
                new OptionSeed("200 OK", false),
                new OptionSeed("202 Accepted", false),
                new OptionSeed("204 No Content", false)
            ));

        addQuestion(q2, "Which annotations/patterns are standard for defining a Spring Data JPA Repository? (Select all that apply)", QuestionType.MULTI, new BigDecimal("2.00"),
            "Extending JpaRepository and using @Repository are standard Spring Data patterns.", 4,
            List.of(
                new OptionSeed("Extending JpaRepository<T, ID>", true),
                new OptionSeed("@Repository stereotype annotation", true),
                new OptionSeed("@Entity annotation on repository interface", false),
                new OptionSeed("@Autowired on the interface definition", false)
            ));

        addQuestion(q2, "What does `@Transactional(readOnly = true)` provide in Hibernate / JPA?", QuestionType.SINGLE, new BigDecimal("1.00"),
            "It turns off dirty-checking snapshot persistence in Hibernate for performance boost.", 5,
            List.of(
                new OptionSeed("Disables Hibernate snapshot dirty checking and optimizes query flushing", true),
                new OptionSeed("Prevents database connection pooling", false),
                new OptionSeed("Enforces write locks on every read table", false),
                new OptionSeed("Converts all SQL queries into asynchronous reactive streams", false)
            ));

        addQuestion(q2, "How does JWT achieve stateless authentication?", QuestionType.SINGLE, new BigDecimal("1.00"),
            "The server verifies the signature with its secret without checking server-side session memory.", 6,
            List.of(
                new OptionSeed("Server verifies signature with its secret key without querying session storage", true),
                new OptionSeed("Tokens are stored in server RAM and looked up by key on every request", false),
                new OptionSeed("The client encrypts the database password inside the cookie", false),
                new OptionSeed("The browser handles authentication natively using hardware TPM", false)
            ));

        addQuestion(q2, "Which method is used in Spring Security 6 to define the security filter chain bean?", QuestionType.SINGLE, new BigDecimal("1.00"),
            "Returning SecurityFilterChain with HttpSecurity lambda configuration is the standard in Spring Security 6.", 7,
            List.of(
                new OptionSeed("public SecurityFilterChain filterChain(HttpSecurity http) throws Exception", true),
                new OptionSeed("extends WebSecurityConfigurerAdapter", false),
                new OptionSeed("public void configure(AuthenticationManagerBuilder auth)", false),
                new OptionSeed("public JwtTokenFilter initializeFilter()", false)
            ));

        addQuestion(q2, "What is the primary role of Spring Boot Actuator?", QuestionType.SINGLE, new BigDecimal("1.00"),
            "Actuator provides production monitoring, metrics, health indicators, and info endpoints.", 8,
            List.of(
                new OptionSeed("Provides health checks, metrics, thread dumps, and monitoring endpoints", true),
                new OptionSeed("Automatically creates database migrations and backups", false),
                new OptionSeed("Generates frontend React components from Spring entities", false),
                new OptionSeed("Serves as an in-memory Redis cache replacement", false)
            ));

        addQuestion(q2, "Which mechanisms prevent N+1 select queries in Spring Data JPA? (Select all that apply)", QuestionType.MULTI, new BigDecimal("2.00"),
            "JOIN FETCH and @EntityGraph are the primary tools to prevent N+1 queries.", 9,
            List.of(
                new OptionSeed("Using 'JOIN FETCH' in custom JPQL / HQL queries", true),
                new OptionSeed("Specifying @EntityGraph on repository query methods", true),
                new OptionSeed("Using FetchType.EAGER on all relations", false),
                new OptionSeed("Setting spring.jpa.show-sql=true in application.properties", false)
            ));

        addQuestion(q2, "What is the difference between `@Controller` and `@RestController` in Spring MVC?", QuestionType.SINGLE, new BigDecimal("1.00"),
            "@RestController combines @Controller and @ResponseBody automatically.", 10,
            List.of(
                new OptionSeed("@RestController combines @Controller and @ResponseBody automatically", true),
                new OptionSeed("@RestController is only for SOAP web services", false),
                new OptionSeed("@Controller automatically returns JSON by default", false),
                new OptionSeed("There is no difference; they are aliases for the same class", false)
            ));

        // Quiz 3, 4, 5 can also be initialized with sample questions
        initQuiz3(databaseSql, admin);
        initQuiz4(cloudDevOps, admin);
        initQuiz5(dsa, admin);
    }

    private void initQuiz3(Category dbCat, User admin) {
        Quiz q3 = quizRepository.save(Quiz.builder()
            .category(dbCat)
            .createdByUser(admin)
            .title("MySQL & High-Performance Relational DBs")
            .slug("mysql-database-mastery")
            .description("Master relational schemas, B-Tree indexes, isolation levels, execution plans, and query optimization.")
            .difficulty(Difficulty.MEDIUM)
            .durationMinutes(15)
            .passPercentage(new BigDecimal("60.00"))
            .negativeMarking(true)
            .negativeMarkingDeduction(new BigDecimal("0.25"))
            .perQuestionTimerSeconds(0)
            .isPublished(true)
            .shuffleQuestions(true)
            .shuffleOptions(true)
            .maxViolationsAllowed(2)
            .build());

        addQuestion(q3, "Which storage engine is the default in MySQL 8.0 with full ACID support?", QuestionType.SINGLE, new BigDecimal("1.00"),
            "InnoDB is the ACID-compliant transactional default storage engine in MySQL.", 1,
            List.of(
                new OptionSeed("InnoDB", true),
                new OptionSeed("MyISAM", false),
                new OptionSeed("Memory", false),
                new OptionSeed("CSV", false)
            ));

        addQuestion(q3, "What data structure does MySQL InnoDB use for primary key clustered indexes?", QuestionType.SINGLE, new BigDecimal("1.00"),
            "InnoDB clusters rows using B+Tree data structures.", 2,
            List.of(
                new OptionSeed("B+Tree", true),
                new OptionSeed("Red-Black Tree", false),
                new OptionSeed("Hash Table", false),
                new OptionSeed("Skip List", false)
            ));

        addQuestion(q3, "Which of the following are ACID properties in relational database transactions? (Select all that apply)", QuestionType.MULTI, new BigDecimal("2.00"),
            "ACID: Atomicity, Consistency, Isolation, Durability.", 3,
            List.of(
                new OptionSeed("Atomicity", true),
                new OptionSeed("Consistency", true),
                new OptionSeed("Durability", true),
                new OptionSeed("Availability", false)
            ));

        addQuestion(q3, "What is the default transaction isolation level in MySQL InnoDB?", QuestionType.SINGLE, new BigDecimal("1.00"),
            "REPEATABLE READ is the default isolation level in InnoDB.", 4,
            List.of(
                new OptionSeed("REPEATABLE READ", true),
                new OptionSeed("READ COMMITTED", false),
                new OptionSeed("SERIALIZABLE", false),
                new OptionSeed("READ UNCOMMITTED", false)
            ));

        addQuestion(q3, "In an EXPLAIN query plan, which 'type' indicates the worst possible query performance?", QuestionType.SINGLE, new BigDecimal("1.00"),
            "type 'ALL' indicates a full table scan reading every single row.", 5,
            List.of(
                new OptionSeed("ALL (Full Table Scan)", true),
                new OptionSeed("ref", false),
                new OptionSeed("range", false),
                new OptionSeed("const", false)
            ));
    }

    private void initQuiz4(Category cloudCat, User admin) {
        Quiz q4 = quizRepository.save(Quiz.builder()
            .category(cloudCat)
            .createdByUser(admin)
            .title("Docker, Kubernetes & Cloud DevOps")
            .slug("docker-kubernetes-devops")
            .description("Verify your operational knowledge of containerization, Pod lifecycle, Helm charts, and CI/CD pipelines.")
            .difficulty(Difficulty.HARD)
            .durationMinutes(20)
            .passPercentage(new BigDecimal("70.00"))
            .negativeMarking(true)
            .negativeMarkingDeduction(new BigDecimal("0.50"))
            .perQuestionTimerSeconds(0)
            .isPublished(true)
            .shuffleQuestions(true)
            .shuffleOptions(true)
            .maxViolationsAllowed(2)
            .build());

        addQuestion(q4, "What is the smallest deployable computing unit in Kubernetes?", QuestionType.SINGLE, new BigDecimal("1.00"),
            "A Pod is the smallest execution unit in Kubernetes.", 1,
            List.of(
                new OptionSeed("Pod", true),
                new OptionSeed("Container", false),
                new OptionSeed("Deployment", false),
                new OptionSeed("Service", false)
            ));

        addQuestion(q4, "In a multi-stage Dockerfile, what is the main benefit of intermediate builder stages?", QuestionType.SINGLE, new BigDecimal("1.00"),
            "Multi-stage builds exclude build SDKs and tools from final images, producing minimal secure containers.", 2,
            List.of(
                new OptionSeed("Drastically reduces final image size and minimizes attack surface", true),
                new OptionSeed("Speeds up CPU clock frequencies inside the container", false),
                new OptionSeed("Allows Docker to run without a daemon process", false),
                new OptionSeed("Automatically connects the container to Kubernetes API", false)
            ));

        addQuestion(q4, "Which Kubernetes object provides declarative updates for Pods and ReplicaSets?", QuestionType.SINGLE, new BigDecimal("1.00"),
            "A Deployment handles declarative lifecycle updates and rollouts.", 3,
            List.of(
                new OptionSeed("Deployment", true),
                new OptionSeed("ConfigMap", false),
                new OptionSeed("DaemonSet", false),
                new OptionSeed("StatefulSet", false)
            ));
    }

    private void initQuiz5(Category dsaCat, User admin) {
        Quiz q5 = quizRepository.save(Quiz.builder()
            .category(dsaCat)
            .createdByUser(admin)
            .title("Advanced Data Structures & Algorithms")
            .slug("advanced-dsa-optimization")
            .description("Challenge your problem-solving with trees, DP, graph traversal, asymptotic complexity, and memoization.")
            .difficulty(Difficulty.HARD)
            .durationMinutes(25)
            .passPercentage(new BigDecimal("60.00"))
            .negativeMarking(false)
            .negativeMarkingDeduction(BigDecimal.ZERO)
            .perQuestionTimerSeconds(0)
            .isPublished(true)
            .shuffleQuestions(true)
            .shuffleOptions(true)
            .maxViolationsAllowed(3)
            .build());

        addQuestion(q5, "What is the average time complexity of searching in a balanced Binary Search Tree (AVL / Red-Black)?", QuestionType.SINGLE, new BigDecimal("1.00"),
            "Balanced BSTs guarantee height O(log n), so search takes O(log n).", 1,
            List.of(
                new OptionSeed("O(log n)", true),
                new OptionSeed("O(1)", false),
                new OptionSeed("O(n)", false),
                new OptionSeed("O(n log n)", false)
            ));

        addQuestion(q5, "Which sorting algorithm has a guaranteed worst-case time complexity of O(n log n)?", QuestionType.SINGLE, new BigDecimal("1.00"),
            "Merge sort guarantees O(n log n) in all cases.", 2,
            List.of(
                new OptionSeed("Merge Sort", true),
                new OptionSeed("Quick Sort", false),
                new OptionSeed("Bubble Sort", false),
                new OptionSeed("Insertion Sort", false)
            ));
    }

    private void addQuestion(Quiz quiz, String text, QuestionType type, BigDecimal marks, String explanation, int order, List<OptionSeed> options) {
        Question q = questionRepository.save(Question.builder()
            .quiz(quiz)
            .questionText(text)
            .questionType(type)
            .marks(marks)
            .explanation(explanation)
            .orderIndex(order)
            .build());

        int optOrder = 1;
        for (OptionSeed os : options) {
            optionRepository.save(Option.builder()
                .question(q)
                .optionText(os.text)
                .isCorrect(os.isCorrect)
                .orderIndex(optOrder++)
                .build());
        }
    }

    private static class OptionSeed {
        String text;
        boolean isCorrect;

        OptionSeed(String text, boolean isCorrect) {
            this.text = text;
            this.isCorrect = isCorrect;
        }
    }
}
