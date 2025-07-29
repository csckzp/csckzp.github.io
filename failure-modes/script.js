// Risk information database
const riskData = {
    translation: {
        performance: {
            title: "Problem Translation - Performance Risk",
            description: "How you translate real-world problems into ML labels significantly impacts model performance.",
            details: [
                "• Poorly defined labels lead to inconsistent training data",
                "• Ambiguous problem statements result in conflicting objectives",
                "• Missing edge cases in label definition cause poor generalization",
                "• Oversimplified labels may not capture problem complexity"
            ],
            examples: "Example: Translating 'customer satisfaction' to binary labels (satisfied/unsatisfied) loses nuanced feedback that could improve model accuracy.",
            mitigation: "Mitigation: Work closely with domain experts, use pilot studies, and iterate on label definitions based on data analysis."
        },
        execution: {
            title: "Problem Translation - Execution Risk",
            description: "Clear problem definition reduces computational waste and development overhead.",
            details: [
                "• Well-defined problems lead to efficient data collection",
                "• Clear objectives prevent unnecessary feature engineering",
                "• Proper scoping avoids over-complex model architectures",
                "• Good translation reduces debugging time"
            ],
            examples: "Example: Clearly defining whether you need real-time vs. batch predictions affects infrastructure choices significantly.",
            mitigation: "Mitigation: Create detailed problem specifications, use prototyping, and validate assumptions early."
        },
        societal: {
            title: "Problem Translation - Societal Risk",
            description: "How problems are framed and labels are defined can embed significant societal biases.",
            details: [
                "• Biased problem framing perpetuates existing inequalities",
                "• Label definitions may exclude marginalized groups",
                "• Oversimplified categorizations can harm diverse populations",
                "• Business objectives may conflict with social good"
            ],
            examples: "Example: Defining 'creditworthiness' using historical data may perpetuate racial and economic biases in lending.",
            mitigation: "Mitigation: Include diverse stakeholders in problem definition, conduct bias audits, and consider societal impact throughout the process."
        }
    },
    techstack: {
        performance: {
            title: "Tech Stack Choice - Performance Risk",
            description: "Technology choices moderately impact model performance through optimization capabilities.",
            details: [
                "• Some frameworks offer better optimization for specific algorithms",
                "• Hardware compatibility affects training speed and model size",
                "• Library limitations may restrict advanced techniques",
                "• Version compatibility can affect reproducibility"
            ],
            examples: "Example: Using TensorFlow vs. PyTorch vs. scikit-learn affects available optimization techniques and model architectures.",
            mitigation: "Mitigation: Benchmark different frameworks for your specific use case, consider long-term support, and plan for scalability."
        },
        execution: {
            title: "Tech Stack Choice - Execution Risk",
            description: "Technology stack choice is critical for system performance, scalability, and maintenance.",
            details: [
                "• Framework performance varies significantly across use cases",
                "• Infrastructure requirements affect deployment costs",
                "• Learning curves impact development speed",
                "• Ecosystem maturity affects available tools and support"
            ],
            examples: "Example: Choosing between cloud services (AWS, GCP, Azure) affects cost, scalability, and vendor lock-in risks.",
            mitigation: "Mitigation: Conduct proof-of-concept implementations, consider total cost of ownership, and evaluate team expertise."
        },
        societal: {
            title: "Tech Stack Choice - Societal Risk",
            description: "Technology choices can perpetuate biases and create accessibility barriers.",
            details: [
                "• Some frameworks have built-in biases in pre-trained models",
                "• Closed-source solutions lack transparency",
                "• Expensive technologies create barriers for smaller organizations",
                "• Geographic restrictions may limit global accessibility"
            ],
            examples: "Example: Using proprietary algorithms prevents external auditing for bias and fairness, reducing accountability.",
            mitigation: "Mitigation: Prioritize open-source solutions when possible, ensure transparency in model decisions, and consider global accessibility."
        }
    },
    samplesize: {
        performance: {
            title: "Sample Size - Performance Risk",
            description: "Insufficient sample size is one of the highest risks for model performance.",
            details: [
                "• Small datasets lead to overfitting and poor generalization",
                "• Insufficient data for rare classes causes imbalanced predictions",
                "• Limited samples prevent proper train/validation/test splits",
                "• Inadequate data diversity reduces model robustness"
            ],
            examples: "Example: Training a medical diagnosis model with only 100 samples per condition will likely result in unreliable predictions.",
            mitigation: "Mitigation: Use power analysis to determine required sample sizes, employ data augmentation techniques, and consider transfer learning."
        },
        execution: {
            title: "Sample Size - Execution Risk",
            description: "Sample size significantly impacts computational requirements and training time.",
            details: [
                "• Large datasets require more storage and memory",
                "• Training time scales with dataset size",
                "• Data processing pipelines become more complex",
                "• Distributed computing may be necessary for very large datasets"
            ],
            examples: "Example: Processing millions of images requires distributed computing infrastructure and optimized data loading pipelines.",
            mitigation: "Mitigation: Use efficient data formats, implement batch processing, consider data sampling strategies, and plan infrastructure scaling."
        },
        societal: {
            title: "Sample Size - Societal Risk",
            description: "Sample size and representativeness directly impact fairness and bias in ML systems.",
            details: [
                "• Small sample sizes for minority groups lead to biased models",
                "• Unrepresentative samples perpetuate existing inequalities",
                "• Geographic or demographic sampling bias affects global applicability",
                "• Temporal sampling bias may not reflect current populations"
            ],
            examples: "Example: A facial recognition system trained primarily on one demographic performs poorly on others, leading to discriminatory outcomes.",
            mitigation: "Mitigation: Ensure representative sampling across all demographic groups, use stratified sampling, and regularly audit for bias."
        }
    },
    features: {
        performance: {
            title: "Feature Engineering - Performance Risk",
            description: "Feature quality is fundamental to model performance - poor features mean poor models.",
            details: [
                "• Irrelevant features add noise and reduce accuracy",
                "• Missing important features limits model capability",
                "• Poor feature scaling affects algorithm performance",
                "• Highly correlated features can cause instability"
            ],
            examples: "Example: Using raw text without proper preprocessing (tokenization, normalization) severely limits NLP model performance.",
            mitigation: "Mitigation: Use domain expertise for feature selection, apply proper preprocessing, conduct feature importance analysis, and iterative refinement."
        },
        execution: {
            title: "Feature Engineering - Execution Risk",
            description: "Feature complexity directly impacts computational requirements and system performance.",
            details: [
                "• Complex feature engineering increases preprocessing time",
                "• High-dimensional features require more memory and computation",
                "• Feature pipelines add system complexity and potential failure points",
                "• Real-time feature computation may not be feasible"
            ],
            examples: "Example: Computing complex NLP features in real-time for recommendation systems may exceed acceptable latency thresholds.",
            mitigation: "Mitigation: Balance feature complexity with performance requirements, use feature caching, and optimize preprocessing pipelines."
        },
        societal: {
            title: "Feature Engineering - Societal Risk",
            description: "Features can encode and amplify societal biases, leading to discriminatory outcomes.",
            details: [
                "• Proxy features may indirectly encode protected attributes",
                "• Historical data in features perpetuates past discrimination",
                "• Feature selection may systematically exclude certain groups",
                "• Interaction effects between features can create unexpected biases"
            ],
            examples: "Example: Using ZIP code as a feature in lending decisions may inadvertently discriminate based on historical redlining practices.",
            mitigation: "Mitigation: Conduct fairness audits on features, avoid proxy variables for protected attributes, and test for discriminatory impact."
        }
    },
    modelset: {
        performance: {
            title: "Model Selection - Performance Risk",
            description: "Limited model exploration can result in suboptimal performance and missed opportunities.",
            details: [
                "• Testing only one algorithm type may miss better solutions",
                "• Insufficient hyperparameter tuning leads to poor performance",
                "• Not considering ensemble methods limits accuracy potential",
                "• Ignoring domain-specific models reduces effectiveness"
            ],
            examples: "Example: Only testing linear models for complex non-linear relationships will result in poor predictive performance.",
            mitigation: "Mitigation: Use automated ML tools, implement systematic model comparison, and consider ensemble approaches."
        },
        execution: {
            title: "Model Selection - Execution Risk",
            description: "Model complexity affects training time, inference speed, and system resource requirements.",
            details: [
                "• Complex models require more computational resources",
                "• Some models are difficult to parallelize effectively",
                "• Model size affects memory requirements and storage",
                "• Training time varies dramatically between model types"
            ],
            examples: "Example: Deep learning models may require GPU clusters and days of training time compared to minutes for simpler models.",
            mitigation: "Mitigation: Consider computational budget constraints, use model complexity analysis, and balance accuracy with efficiency."
        },
        societal: {
            title: "Model Selection - Societal Risk",
            description: "Model choice generally has lower direct societal impact, but interpretability matters for accountability.",
            details: [
                "• Black-box models reduce transparency and accountability",
                "• Complex models make bias detection more difficult",
                "• Some models are inherently more prone to certain types of bias",
                "• Model complexity affects stakeholder trust and adoption"
            ],
            examples: "Example: Using highly complex ensemble models in criminal justice systems makes it difficult to explain decisions to defendants.",
            mitigation: "Mitigation: Prioritize interpretable models for high-stakes decisions, use explainable AI techniques, and document model selection rationale."
        }
    },
    metrics: {
        performance: {
            title: "Performance Metrics - Performance Risk",
            description: "Wrong metrics can hide poor performance and lead to false confidence in model quality.",
            details: [
                "• Accuracy alone doesn't show class imbalance issues",
                "• Wrong metrics for the problem type mislead optimization",
                "• Vanity metrics may not reflect real-world performance",
                "• Single metrics miss important trade-offs"
            ],
            examples: "Example: Using accuracy for a medical diagnosis task with 95% healthy patients shows 95% accuracy even for a model that never detects disease.",
            mitigation: "Mitigation: Use multiple complementary metrics, choose metrics aligned with business objectives, and validate with domain experts."
        },
        execution: {
            title: "Performance Metrics - Execution Risk",
            description: "Metric computation generally has minimal computational overhead in most ML systems.",
            details: [
                "• Most standard metrics are computationally inexpensive",
                "• Metric calculation is typically fast compared to model training",
                "• Advanced metrics may require additional computation",
                "• Real-time metric monitoring has minimal overhead"
            ],
            examples: "Example: Computing standard classification metrics (precision, recall, F1) adds negligible computational cost to most systems.",
            mitigation: "Mitigation: Optimize only if metrics become a bottleneck, use sampling for expensive metrics, and cache metric calculations where appropriate."
        },
        societal: {
            title: "Performance Metrics - Societal Risk",
            description: "Metrics that ignore fairness can mask discriminatory behavior and perpetuate bias.",
            details: [
                "• Standard metrics don't measure fairness across groups",
                "• Optimizing for overall performance may harm minority groups",
                "• Metrics may not capture long-term societal impacts",
                "• Business metrics may conflict with social good"
            ],
            examples: "Example: A hiring algorithm optimized for precision may systematically exclude qualified candidates from underrepresented groups.",
            mitigation: "Mitigation: Include fairness metrics in evaluation, measure performance across demographic groups, and consider long-term societal impact."
        }
    }
};

// Concept explanations
const conceptData = {
    performance: {
        title: "Understanding Performance Failure Risk",
        content: `
            <h4>What is Performance Failure Risk?</h4>
            <p>Performance failure risk refers to the likelihood that your ML model will not achieve acceptable accuracy, precision, recall, or other predictive performance metrics.</p>
            
            <h4>Key Factors:</h4>
            <ul>
                <li><strong>Data Quality:</strong> Poor data leads to poor models</li>
                <li><strong>Feature Engineering:</strong> Wrong features = wrong predictions</li>
                <li><strong>Model Selection:</strong> Choosing inappropriate algorithms</li>
                <li><strong>Sample Size:</strong> Insufficient data for learning</li>
                <li><strong>Evaluation Strategy:</strong> Poor validation leads to overfitting</li>
            </ul>
            
            <h4>Common Symptoms:</h4>
            <ul>
                <li>Low accuracy on test data</li>
                <li>High variance in predictions</li>
                <li>Poor generalization to new data</li>
                <li>Inconsistent performance across different data segments</li>
            </ul>
        `
    },
    execution: {
        title: "Understanding Execution Bottleneck Risk",
        content: `
            <h4>What is Execution Bottleneck Risk?</h4>
            <p>Execution bottleneck risk refers to computational, resource, or scalability issues that prevent your ML system from running efficiently in production.</p>
            
            <h4>Key Factors:</h4>
            <ul>
                <li><strong>Computational Complexity:</strong> Model and feature complexity</li>
                <li><strong>Infrastructure:</strong> Hardware and software limitations</li>
                <li><strong>Data Pipeline:</strong> Data loading and preprocessing efficiency</li>
                <li><strong>Scalability:</strong> System performance under load</li>
                <li><strong>Memory Management:</strong> Efficient resource utilization</li>
            </ul>
            
            <h4>Common Symptoms:</h4>
            <ul>
                <li>Slow training times</li>
                <li>High inference latency</li>
                <li>Memory overflow errors</li>
                <li>Poor system utilization</li>
                <li>Inability to scale to production loads</li>
            </ul>
        `
    },
    societal: {
        title: "Understanding Societal Failure Risk",
        content: `
            <h4>What is Societal Failure Risk?</h4>
            <p>Societal failure risk refers to the potential for ML systems to cause harm through bias, discrimination, privacy violations, or other negative social impacts.</p>
            
            <h4>Key Factors:</h4>
            <ul>
                <li><strong>Algorithmic Bias:</strong> Systematic unfairness toward certain groups</li>
                <li><strong>Privacy Concerns:</strong> Misuse of personal data</li>
                <li><strong>Transparency:</strong> Lack of explainability in decisions</li>
                <li><strong>Representation:</strong> Excluding or misrepresenting groups</li>
                <li><strong>Long-term Impact:</strong> Unintended consequences over time</li>
            </ul>
            
            <h4>Common Symptoms:</h4>
            <ul>
                <li>Disparate impact on different demographic groups</li>
                <li>Public backlash or regulatory scrutiny</li>
                <li>Reinforcement of existing inequalities</li>
                <li>Loss of public trust</li>
                <li>Legal or ethical violations</li>
            </ul>
        `
    }
};

// Quiz questions
const quizQuestions = [
    {
        question: "Which ML decision has the highest risk for societal failure?",
        options: [
            "Choice of performance metrics",
            "Sample size selection", 
            "Translation of problem to labels",
            "Model architecture choice"
        ],
        correct: 2,
        explanation: "Problem translation has high societal risk because biased problem framing can perpetuate inequalities and exclude marginalized groups."
    },
    {
        question: "What is the main execution risk of using very large datasets?",
        options: [
            "Lower model accuracy",
            "Increased computational requirements",
            "Higher societal bias",
            "Worse feature quality"
        ],
        correct: 1,
        explanation: "Large datasets require more storage, memory, and processing power, significantly increasing computational requirements."
    },
    {
        question: "Why is feature engineering critical for performance?",
        options: [
            "It determines the computational cost",
            "It affects model interpretability",
            "Poor features lead to poor model performance",
            "It influences data collection strategies"
        ],
        correct: 2,
        explanation: "Feature quality is fundamental to model performance - irrelevant or poorly engineered features add noise and reduce accuracy."
    }
];

// DOM elements
let selectedCell = null;
let currentQuizQuestion = 0;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeRiskMatrix();
    initializeConceptCards();
    initializeQuiz();
    initializeOverlayControls();
});

// Initialize overlay controls
function initializeOverlayControls() {
    const closeBtn = document.getElementById('closePanelBtn');
    const overlay = document.getElementById('infoPanel');
    
    if (!closeBtn || !overlay) {
        console.error('Overlay elements not found');
        return;
    }
    
    // Close button functionality
    closeBtn.addEventListener('click', function() {
        hideInfoPanel();
    });
    
    // Close on overlay background click
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            hideInfoPanel();
        }
    });
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && overlay.classList.contains('show')) {
            hideInfoPanel();
        }
    });
}

// Show the info panel overlay
function showInfoPanel() {
    const overlay = document.getElementById('infoPanel');
    overlay.style.display = 'flex';
    // Use timeout to ensure display change takes effect before adding show class
    setTimeout(() => {
        overlay.classList.add('show');
    }, 10);
}

// Hide the info panel overlay
function hideInfoPanel() {
    const overlay = document.getElementById('infoPanel');
    overlay.classList.remove('show');
    
    // Clear selected cell
    if (selectedCell) {
        selectedCell.classList.remove('selected');
        selectedCell = null;
    }
    
    // Hide overlay after animation completes
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 300);
}

// Initialize risk matrix interactions
function initializeRiskMatrix() {
    const riskCells = document.querySelectorAll('.risk-cell');
    
    riskCells.forEach(cell => {
        cell.addEventListener('click', function() {
            // Remove previous selection
            if (selectedCell) {
                selectedCell.classList.remove('selected');
            }
            
            // Select new cell
            selectedCell = this;
            this.classList.add('selected');
            
            // Get risk data
            const decision = this.dataset.decision;
            const category = this.dataset.category;
            const riskLevel = this.dataset.risk;
            
            // Update info panel
            updateInfoPanel(decision, category, riskLevel);
        });
        
        // Add hover effects
        cell.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        cell.addEventListener('mouseleave', function() {
            if (this !== selectedCell) {
                this.style.transform = 'scale(1)';
            }
        });
    });
}

// Update the information panel
function updateInfoPanel(decision, category, riskLevel) {
    const infoPanel = document.getElementById('riskContent');
    const data = riskData[decision][category];
    
    const riskLevelText = riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
    
    infoPanel.innerHTML = `
        <div class="risk-details fade-in">
            <h4>${data.title}</h4>
            <div class="risk-level-indicator">
                <strong>Risk Level: <span class="${riskLevel}-risk">${riskLevelText} Risk</span></strong>
            </div>
            <p><strong>Overview:</strong> ${data.description}</p>
            
            <h5>Key Risk Factors:</h5>
            <div class="risk-factors">
                ${data.details.map(detail => `<p>${detail}</p>`).join('')}
            </div>
            
            <h5>Real-World Example:</h5>
            <p class="example-text">${data.examples}</p>
            
            <h5>Mitigation Strategies:</h5>
            <p class="mitigation-text">${data.mitigation}</p>
        </div>
    `;
    
    // Show the overlay panel
    showInfoPanel();
}

// Initialize concept cards
function initializeConceptCards() {
    const learnMoreBtns = document.querySelectorAll('.learn-more-btn');
    
    learnMoreBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const concept = this.dataset.concept;
            showConceptDetails(concept);
        });
    });
}

// Show detailed concept information
function showConceptDetails(concept) {
    const infoPanel = document.getElementById('riskContent');
    const data = conceptData[concept];
    
    // Clear any selected cell
    if (selectedCell) {
        selectedCell.classList.remove('selected');
        selectedCell = null;
    }
    
    infoPanel.innerHTML = `
        <div class="concept-details fade-in">
            <h4>${data.title}</h4>
            ${data.content}
            <div style="margin-top: 2rem;">
                <button onclick="showQuiz()" class="learn-more-btn">Test Your Knowledge</button>
            </div>
        </div>
    `;
    
    // Show the overlay panel
    showInfoPanel();
}

// Initialize quiz functionality
function initializeQuiz() {
    // Quiz is initialized but hidden initially
    currentQuizQuestion = 0;
}

// Show quiz section
function showQuiz() {
    const quizSection = document.getElementById('quizSection');
    quizSection.style.display = 'block';
    quizSection.scrollIntoView({ behavior: 'smooth' });
    
    displayQuizQuestion();
}

// Display current quiz question
function displayQuizQuestion() {
    const quizContent = document.getElementById('quizContent');
    const question = quizQuestions[currentQuizQuestion];
    
    quizContent.innerHTML = `
        <div class="quiz-question fade-in">
            <h4>Question ${currentQuizQuestion + 1} of ${quizQuestions.length}</h4>
            <p><strong>${question.question}</strong></p>
            <div class="quiz-options">
                ${question.options.map((option, index) => 
                    `<button class="quiz-option" onclick="selectAnswer(${index})" data-index="${index}">
                        ${option}
                    </button>`
                ).join('')}
            </div>
            <div id="questionFeedback" style="margin-top: 1rem; display: none;"></div>
        </div>
    `;
}

// Handle quiz answer selection
function selectAnswer(selectedIndex) {
    const question = quizQuestions[currentQuizQuestion];
    const options = document.querySelectorAll('.quiz-option');
    const feedback = document.getElementById('questionFeedback');
    
    // Disable all options
    options.forEach(option => option.disabled = true);
    
    // Show correct/incorrect styling
    options.forEach((option, index) => {
        if (index === question.correct) {
            option.classList.add('correct');
        } else if (index === selectedIndex && index !== question.correct) {
            option.classList.add('incorrect');
        }
    });
    
    // Show explanation
    const isCorrect = selectedIndex === question.correct;
    feedback.innerHTML = `
        <p><strong>${isCorrect ? 'Correct!' : 'Incorrect.'}</strong></p>
        <p>${question.explanation}</p>
        <button class="learn-more-btn" onclick="nextQuestion()" style="margin-top: 1rem;">
            ${currentQuizQuestion < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </button>
    `;
    feedback.style.display = 'block';
}

// Move to next quiz question
function nextQuestion() {
    currentQuizQuestion++;
    
    if (currentQuizQuestion < quizQuestions.length) {
        displayQuizQuestion();
    } else {
        showQuizResults();
    }
}

// Show quiz completion
function showQuizResults() {
    const quizContent = document.getElementById('quizContent');
    
    quizContent.innerHTML = `
        <div class="quiz-completion fade-in">
            <h4>Quiz Complete!</h4>
            <p>Great job exploring ML risk assessment concepts!</p>
            <p>Continue exploring the risk matrix above to deepen your understanding of how different ML decisions impact performance, execution, and societal outcomes.</p>
            <button class="learn-more-btn" onclick="resetQuiz()">Retake Quiz</button>
        </div>
    `;
}

// Reset quiz to beginning
function resetQuiz() {
    currentQuizQuestion = 0;
    displayQuizQuestion();
}

// Add some dynamic visual effects
document.addEventListener('DOMContentLoaded', function() {
    // Add pulse effect to important elements
    setTimeout(() => {
        const matrix = document.querySelector('.risk-matrix');
        matrix.classList.add('pulse');
        setTimeout(() => matrix.classList.remove('pulse'), 2000);
    }, 1000);
    
    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
});
