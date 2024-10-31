let questions = [];

// Fetch questions from questions.json
fetch('questions.json')
    .then(response => response.json())
    .then(data => {
        questions = data;
        shuffle(questions);
        questions.forEach(question => {
            if (question.type === "multiple-choice") {
                shuffle(question.options);
            } else if (question.type === "true-false") {
                shuffle(question.statements); // Shuffle the statements
            }
        });
        showQuestion(0);
    })
    .catch(error => console.error('Error fetching questions:', error));

// Shuffling function
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Function to show questions
let currentQuestionIndex = 0;
function showQuestion(questionIndex) {
    if (questionIndex < questions.length) {
        const questionElement = document.getElementById('question');
        let questionHtml = `<h2>${questions[questionIndex].question}</h2>
                            <p>Question ${questionIndex + 1} / ${questions.length}</p>`;

        if (questions[questionIndex].type === "multiple-choice") {
            questionHtml += `<form id="form${questionIndex}">
                                ${questions[questionIndex].options.map(option => `
                                    <input type="radio" id="q${questionIndex}_${option}" name="q${questionIndex}" value="${option}">
                                    <label for="q${questionIndex}_${option}">${option}</label>
                                `).join('')}
                                <button type="button" onclick="checkAnswer(${questionIndex})">Next</button>
                             </form>`;
        } else if (questions[questionIndex].type === "true-false") {
            shuffle(questions[questionIndex].statements); // Shuffle the statements before displaying

            questionHtml += `<form id="form${questionIndex}">
                                ${questions[questionIndex].statements.map((statement, index) => `
                                    <div>
                                        <p>${index + 1}. ${statement.text}</p>
                                        <input type="radio" id="q${questionIndex}_s${index}_true" name="q${questionIndex}_s${index}" value="đúng">
                                        <label for="q${questionIndex}_s${index}_true">Đúng</label>
                                        <input type="radio" id="q${questionIndex}_s${index}_false" name="q${questionIndex}_s${index}" value="sai">
                                        <label for="q${questionIndex}_s${index}_false">Sai</label>
                                    </div>
                                `).join('')}
                                <button type="button" onclick="checkStatements(${questionIndex})">Next</button>
                             </form>`;
        }

        questionElement.innerHTML = questionHtml;
        MathJax.typeset(); // Render the math
    } else {
        showResults();
    }
}

// Array to store user answers
const userAnswers = [];

// Function to check answers for multiple-choice questions
function checkAnswer(questionIndex) {
    const form = document.getElementById(`form${questionIndex}`);
    const selectedOption = form.querySelector(`input[name="q${questionIndex}"]:checked`);
    const correctAnswer = questions[questionIndex].correct;

    if (selectedOption) {
        userAnswers[questionIndex] = selectedOption.value;

        // Highlight correct and incorrect answers
        form.querySelectorAll('input[type="radio"]').forEach(input => {
            const label = input.nextElementSibling;
            if (input.value === correctAnswer) {
                label.classList.add('correct');
            }
            if (input.checked && input.value !== correctAnswer) {
                label.classList.add('incorrect');
            }
            input.disabled = true; // Disable all options
        });

        const button = form.querySelector('button');
        button.textContent = "Next Question";
        button.onclick = () => showQuestion(questionIndex + 1);
    } else {
        alert("Please select an answer!");
    }
}

// Function to check answers for true/false questions
function checkStatements(questionIndex) {
    const form = document.getElementById(`form${questionIndex}`);
    const statements = questions[questionIndex].statements;
    let allSelected = true;

    statements.forEach((statement, index) => {
        const selectedOption = form.querySelector(`input[name="q${questionIndex}_s${index}"]:checked`);
        if (selectedOption) {
            const correctAnswer = statement.correct;
            const label = selectedOption.nextElementSibling;

            if (selectedOption.value === correctAnswer) {
                label.classList.add('correct');
            } else {
                label.classList.add('incorrect');
                form.querySelector(`input[name="q${questionIndex}_s${index}"][value="${correctAnswer}"]`).nextElementSibling.classList.add('correct');
            }
        } else {
            allSelected = false;
        }
    });

    if (allSelected) {
        statements.forEach((statement, index) => {
            form.querySelectorAll(`input[name="q${questionIndex}_s${index}"]`).forEach(input => input.disabled = true); // Disable all options
        });
        
        const button = form.querySelector('button');
        button.textContent = "Next Question";
        button.onclick = () => showQuestion(questionIndex + 1);
    } else {
        alert("Please select an answer for all statements!");
    }
}

// Function to show results and add retry button
function showResults() {
    const resultsElement = document.getElementById('question');
    resultsElement.innerHTML = `<h2>Quiz Completed!</h2>
        <p>You have completed the quiz.</p>
        <button onclick="retryQuiz()">Retry</button>`;
}

// Function to retry the quiz
function retryQuiz() {
    location.reload(); // Reloads the page to restart the quiz
}

// On window load, show the first question
window.onload = function() {
    showQuestion(0);
}
