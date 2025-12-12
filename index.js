document.addEventListener("DOMContentLoaded", function(){
    const searchBtn = document.getElementById("search_btn");
    const usernameInput = document.getElementById("user_input");
    const easyProgressCircle = document.querySelector(".easy_progress");
    const mediumProgressCircle = document.querySelector(".medium_progress");
    const hardProgressCircle = document.querySelector(".difficult_progress");
    const easyLabel = document.getElementById("easy_label");
    const mediumLabel = document.getElementById("medium_label");
    const hardLabel = document.getElementById("difficult_label");
    const nonExistent = document.querySelector(".nonExistent");

    //READ BOTTOM TO TOP

    function updateCircle(total, solved, label, circle){
        const solvedPercentage = (solved/total)*100;
        circle.style.setProperty("--progress", `${solvedPercentage}%`);
        label.textContent = `${solved}/${total}`;
    }

    //Open console and refer to the structure of parsedData
    function displayUserData(parsedData){
        const total = parsedData.data.allQuestionsCount[0].count;
        const totalEasy = parsedData.data.allQuestionsCount[1].count;
        const totalMedium = parsedData.data.allQuestionsCount[2].count;
        const totalHard = parsedData.data.allQuestionsCount[3].count;

        const totalSolved = parsedData.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const totalEasySolved = parsedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const totalMediumSolved = parsedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const totalHardSolved = parsedData.data.matchedUser.submitStats.acSubmissionNum[3].count;

        updateCircle(totalEasy, totalEasySolved, easyLabel, easyProgressCircle);
        updateCircle(totalMedium, totalMediumSolved, mediumLabel, mediumProgressCircle);
        updateCircle(totalHard, totalHardSolved, hardLabel, hardProgressCircle);
    }
    
    //Check for regular expression
    function validUsername(username){
        if(username.trim() === ""){
            alert("Username should not be empty");
            return false;
        }
        const regex = /^[A-Za-z0-9_-]{3,15}$/;
        const isRegex = regex.test(username);
        if(!isRegex){
            alert("Please enter valid username");
        }
        return isRegex;
    }

    async function fetchUserDetails(username){
        try{
            searchBtn.textContent = "Searching...";
            searchBtn.disabled = true;

            //Fetching information
            const proxyUrl = "https://cors-anywhere.herokuapp.com/";
            const targetUrl = "https://leetcode.com/graphql/";
            const myHeaders = new Headers();
            myHeaders.append("content-type", "application/json");

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
                            }
                            totalSubmissionNum {
                                difficulty
                                count
                            }
                        }
                    }
                }
            `,
            variables: { "username": `${username}` }
            });

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
                redirect: "follow"
            };

            const response = await fetch(proxyUrl+targetUrl, requestOptions);

            if(!response.ok){
                throw new Error("Unable to fetch user details");
            }

            const parsedData = await response.json();
            console.log("Parsed Data:", parsedData);
            displayUserData(parsedData);
        }
        catch(err){
            nonExistent.innerHTML = `<p style="color: red;">No data found!</p>`;
            easyLabel.textContent = "--";
            mediumLabel.textContent = "--";
            hardLabel.textContent = "--";
            
            document.querySelectorAll('.circle').forEach(c => {
                c.style.setProperty('--progress', '0%');
            });

            alert("Try another username");
        }
        finally{
            searchBtn.textContent = "Search";
            searchBtn.disabled = false;
        }
    }

    searchBtn.addEventListener('click', function(){
        const username = usernameInput.value;
        if(validUsername(username)){
            fetchUserDetails(username);
        }
    })
})