//  https://cors-anywhere.herokuapp.com/corsdemo

document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");
    const statsContainer = document.querySelector(".stats-container");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");
    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");
    const cardStatsContainer = document.querySelector(".stats-cards");

    function validateUsername(username) {
        if (username.trim() === "") {
            alert("Username should not be empty");
            return false;
        }
        const regex = /^[a-zA-Z0-9_-]{1,15}$/;
        const isMatching = regex.test(username);
        if (!isMatching) {
            alert("Invalid Username");
        }
        return isMatching;
    }

    async function fetchUserDetails(username) {
        try {
            searchButton.textContent = "Searching...";
            searchButton.disabled = true;

            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const targetUrl = 'https://leetcode.com/graphql/';
            const fullUrl = proxyUrl + targetUrl;

            const headers = new Headers();
            headers.append("Content-Type", "application/json");

            const graphql = JSON.stringify({
                query: `
                    query userSessionProgress($username: String!) {
                        allQuestionsCount {
                            difficulty
                            count
                        }
                        matchedUser(username: $username) {
                            submitStats {
                                acSubmissionNum {
                                    difficulty
                                    count
                                    submissions
                                }
                                totalSubmissionNum {
                                    difficulty
                                    count
                                    submissions
                                }
                            }
                        }
                    }
                `,
                variables: { username }
            });

            const requestOptions = {
                method: "POST",
                headers: headers,
                body: graphql,
            };

            const response = await fetch(fullUrl, requestOptions);
            if (!response.ok) {
                throw new Error("Unable to fetch the User details");
            }

            const parsedData = await response.json();
            console.log("Logging data: ", parsedData);

            displayUserData(parsedData);
        } catch (error) {
            statsContainer.innerHTML = `<p>${error.message}</p>`;
        } finally {
            searchButton.textContent = "Search";
            searchButton.disabled = false;
        }
    }

    function updateProgress(solved, total, label, circle) {
        const progressDegree = (solved / total) * 100;
        circle.style.setProperty("--progress-degree", `${progressDegree}%`);
        label.textContent = `${solved}/${total}`;
    }

    function displayUserData(parsedData) {
        const allQuestions = parsedData.data.allQuestionsCount;
        const submissions = parsedData.data.matchedUser.submitStats;

        const totalEasyQues = allQuestions.find(q => q.difficulty === "Easy").count;
        const totalMediumQues = allQuestions.find(q => q.difficulty === "Medium").count;
        const totalHardQues = allQuestions.find(q => q.difficulty === "Hard").count;

        const solvedEasy = submissions.acSubmissionNum.find(q => q.difficulty === "Easy").count;
        const solvedMedium = submissions.acSubmissionNum.find(q => q.difficulty === "Medium").count;
        const solvedHard = submissions.acSubmissionNum.find(q => q.difficulty === "Hard").count;

        updateProgress(solvedEasy, totalEasyQues, easyLabel, easyProgressCircle);
        updateProgress(solvedMedium, totalMediumQues, mediumLabel, mediumProgressCircle);
        updateProgress(solvedHard, totalHardQues, hardLabel, hardProgressCircle);

        const totalAll = submissions.totalSubmissionNum.find(q => q.difficulty === "All")?.submissions ?? 0;
        const easyTotal = submissions.totalSubmissionNum.find(q => q.difficulty === "Easy")?.submissions ?? 0;
        const mediumTotal = submissions.totalSubmissionNum.find(q => q.difficulty === "Medium")?.submissions ?? 0;
        const hardTotal = submissions.totalSubmissionNum.find(q => q.difficulty === "Hard")?.submissions ?? 0;

        const cardsData = [
            { label: "Overall Submissions", value: totalAll },
            { label: "Easy Submissions", value: easyTotal },
            { label: "Medium Submissions", value: mediumTotal },
            { label: "Hard Submissions", value: hardTotal },
        ];


        cardStatsContainer.innerHTML = cardsData.map(data =>
            `<div class="card">
                <h4>${data.label}</h4>
                <p>${data.value}</p>
            </div>`
        ).join("");
    }

    searchButton.addEventListener('click', function () {
        const username = usernameInput.value;
        console.log("Logging username: ", username);
        if (validateUsername(username)) {
            fetchUserDetails(username);
        }
    });
});
