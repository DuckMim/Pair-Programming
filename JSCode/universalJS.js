const API = 'https://sitebackend-ebr5.onrender.com/data';

// * ------------ Universal Functions ------------ //
// * --------------- Without Server -------------- //

function PopUpWindowOfError(errorType) {
    let errorBox = document.createElement("div");
    errorBox.setAttribute('class', 'index_errorBox');

    let closeButton = document.createElement("button");
    closeButton.textContent = "X";
    closeButton.setAttribute('class', 'index_errorBoxButton');
    closeButton.onclick = function () {
        errorBox.remove();
    };

    errorBox.innerHTML += `Error: <br> ${errorType} <br>`;
    errorBox.appendChild(closeButton);

    document.body.appendChild(errorBox);
}

// * ---------------- With Server --------------- //

async function LoadData() {
    let res = await fetch(API);
    let data = await res.json();
    return data;
}

async function SaveData(payload) {
    await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
}

async function ResetData() {
    let payload = {
        roomsCodes: [],
        rooms: {}
    };

    await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
}

/*
! Додати до серверної частини, після закінчення розробки
const allowedOrigins = ['https://your-frontend.com', 'https://another-allowed.com'];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  }
}));
*/
