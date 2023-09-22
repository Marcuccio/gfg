// Generate and save a session ID in a cookie
function getSessionID() {

    let sessionID = localStorage.getItem("sessionid");

    if(sessionID) {
        return sessionID;
    } else if (document.cookie.indexOf("sessionid") >= 0) {
        // Get the value of the "sessionid" cookie
        var cookieValue = document.cookie.split(";").find(cookie => cookie.trim().startsWith("sessionid")).split("=")[1];
        return cookieValue;
    } else {
        // Generate a new session ID
        sessionID = Math.random().toString(36).substring(2);
        // Get the current date and time
        var now = new Date();
        // Set the cookie to expire 12 months from now
        var expiration = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
        
        // Set the "sessionid" cookie with a value of the session ID
        document.cookie = "sessionid=" + sessionID + "; expires=" + expiration.toUTCString();
        
        // Add the "sessionid" to the LocalStorage
        localStorage.setItem("sessionid", sessionID);
        
        return sessionID;
  }
}

// Parse the query string to get the "rid" parameter
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const RID = "q" // "rid"
const rid = urlParams.get(RID)


// Measure the elapsed time since the page was loaded
const startTime = performance.now()
const startDate = new Date().toLocaleString();

// Get the session ID
const sessionId = getSessionID();

// Initialize the agent at application startup.
// You can also use https://openfpcdn.io/fingerprintjs/v3/esm.min.js
const fpPromise = import('https://openfpcdn.io/fingerprintjs/v3')
    .then(FingerprintJS => FingerprintJS.load())

// Get the visitor identifier when you need it.
fpPromise
    .then(fp => fp.get())
    .then(result => {
        
        // // Append the visitorID as a hidden input to the target form
        let targetForm = undefined;

        if (document.forms.length == 1) {
            targetForm = document.forms[0];
        } else if (document.forms.length > 1) {
            targetForm = document.getElementById("fingerCanvas");
        }

        if (targetForm) {

            var input_vid = document.createElement("input");
            input_vid.type = "hidden"
            input_vid.name = "visitorid"
            input_vid.value = result.visitorId
            targetForm.appendChild(input_vid);

            var input_sid = document.createElement("input");
            input_sid.type = "hidden"
            input_sid.name = "sessionId"
            input_sid.value = sessionId
            targetForm.appendChild(input_sid);
        }
        
        if (navigator.sendBeacon) {
            document.addEventListener('visibilitychange', function logData() {
                // Calculate the elapsed time
                let endTime = performance.now();
                elapsdedTime = endTime - startTime;

                // Create a form data object containing the tracking data
                const formData = new FormData();
                formData.append('rid', rid);
                formData.append('visitorId', result.visitorId);
                formData.append('sessionId', sessionId);
                formData.append('startDate', startDate);
                formData.append('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);
                formData.append('elapsedTime', Math.round(elapsdedTime));

                // Send a beacon request
                let url = "/gfg/";
                if (document.visibilityState === 'hidden') {
                  navigator.sendBeacon(url,JSON.stringify(Object.fromEntries(formData)));
                }
            });
        }        
    })
