
// Body 
const body = document.querySelector('body');

// State
let currentSection = 'search';
let isLoggedIn = null;

// Sections
const allSections = document.querySelectorAll('section');
const searchSection = document.getElementById('section-search');
const dashboardSection = document.getElementById('section-dashboard');
const tradeSection = document.getElementById('section-trade');
const allCryptosSection = document.getElementById('section-all-cryptos');

// NavLinks
const navContainer = document.querySelector('.navbar');
// const navLogin = document.getElementById('nav-login');
// const navSignup = document.getElementById('nav-signup');

// Modals
const allModals = document.querySelectorAll('.modal');
const modalSignup = document.getElementById('modal-signup');
const modalLogin = document.getElementById('modal-login');
const modalBackground = document.getElementById('modal-background');

// Forms
const formLogin = document.getElementById('form-login');
const formSignup = document.getElementById('form-signup');
const formSearch = document.getElementById('form-search');

// Buttons
const btnToLogin = document.getElementById('btn-to-login');
const btnToSignup = document.getElementById('btn-to-signup');

// Else
const userMessage = document.getElementById('user-message');
const resultsSearch = document.getElementById('results-search');


// Show Section
const showSection = (section) => {
    allSections.forEach(s => s.classList.add('hidden'));
    section.classList.remove('hidden');
}


// Show Modal
const showModal = (modal) => {
    allModals.forEach(m => m.classList.add('hidden'));
    modal.classList.remove('hidden');
    modalBackground.classList.remove('hidden');
};

// Close All Modals
const closeAllModals = () => {
    modalBackground.classList.add('hidden');
    allModals.forEach(m => m.classList.add('hidden'));
}


const removeAllChildNodes = parentNode => {
    while (parentNode.firstChild) {
        parentNode.removeChild(parentNode.firstChild);
    }
}

const logoutUser = () => {
    localStorage.removeItem('userToken');
    showSection(searchSection);
    authenticate();
}

// Change NavBar depending on login state
const changeNavBar = () => {
    removeAllChildNodes(navContainer);
    const navAllCryptos = document.createElement('span');
    const navSearch = document.createElement('span');

   
    navAllCryptos.innerText = 'All Cryptos';
    navSearch.innerText = 'Search';
    navSearch.addEventListener('click', () => showSection(searchSection));
    navAllCryptos.addEventListener('click', () => showSection(allCryptosSection));
    navContainer.append(navSearch, navAllCryptos);

    if (isLoggedIn) {
        const navTrade = document.createElement('span');
        const navDashboard = document.createElement('span');
        const navLogout = document.createElement('span');

        navLogout.innerText = 'Log Out';
        navDashboard.innerText = 'Dashboard';
        navTrade.innerText = 'Trade';

        navDashboard.addEventListener('click', () => showSection(dashboardSection));
        navTrade.addEventListener('click', () => showSection(tradeSection));
        navLogout.addEventListener('click', () => logoutUser());

        navContainer.append(navTrade, navDashboard, navLogout);
    }

    else {
        const navLogin = document.createElement('span');
        const navSignup = document.createElement('span');

        navLogin.innerText = 'Log In';
        navSignup.innerText = 'Sign Up';

        navLogin.addEventListener('click' ,() => showModal(modalLogin));
        navSignup.addEventListener('click' ,() => showModal(modalSignup));

        navContainer.append(navLogin, navSignup);
    }

}




// Authenticate User Check Token. Also Determines which navbar to load for the user.
const authenticate = async () => {
    const userToken = localStorage.getItem('userToken');
    if (userToken) {
        try {   
            const response = await axios.get('http://localhost:3001/users/verify',{
                headers: {
                    userToken
                }
            });
        
            const { message} = response.data;
            if (message === 'ok') {
                isLoggedIn = true;
            }
        }
        catch({response}) {
            isLoggedIn = false;
          
        }
    }

   else {
       isLoggedIn = false;
   }

   
   changeNavBar();
}



// Event Handlers
const handleFormLogin = async event => {
    event.preventDefault();
    
    const [usernameInput , passwordInput] = event.target.elements;
    
    const formParams = {
        username: usernameInput.value,
        password: passwordInput.value,
    };

    try {
       const response = await axios.post('http://localhost:3001/users/login', formParams);
       const {userToken, message} = response.data;
       if (message === 'ok') {
           localStorage.setItem('userToken', userToken);
           authenticate();
           usernameInput.value = '';
           passwordInput.value = '';
           closeAllModals();
       }

    }
    catch({response}) {
        displayErrorMessage(response.data.error);
    }
}

const handleFormSignup = async event => {
    event.preventDefault();
    try {
        const [username, email, passwordOne, passwordTwo, balance] = event.target.elements;
      
        if (passwordOne.value !== passwordTwo.value) {
            passwordOne.value = '';
            passwordTwo.value = '';
            throw new Error('Passwords do not Match!');
        }

        const formParams = {
            username: username.value,
            email: email.value,
            password: passwordOne.value,
            balance: balance.value
        };

        const response = await axios.post('http://localhost:3001/users', formParams);

        console.log(response);


    }
    catch(error) {
     
        if (error.message === '') {
            console.log(error.response);
            displayErrorMessage(error.message);
            return;
        }
       
        displayErrorMessage(error.response.data.error);
    }

}

const handleFormSearch = async event => {
    event.preventDefault();
    const searchInput = event.target.elements[0];

    try {
        if (searchInput.value === '') throw new Error('Search Field Cannot Be Blank!');

        const response = await axios.get(`http://localhost:3001/cryptos?q=${searchInput.value}`);
        
        if (response.data.message === 'ok') {
            const { cryptos } = response.data;
            removeAllChildNodes(resultsSearch);
            if (!cryptos.length) {
                resultsSearch.innerHTML = '<h3>Nothing was found </h3>';
            }
            else {
                cryptos.forEach(crypto => {
                    const cardHolder = createCryptoCard(crypto);
                    resultsSearch.append(cardHolder);
                })
            }
            
            searchInput.value = '';
        }
    }
    catch(error) {
        if (error.message) {
            displayErrorMessage(error.message);
            return;
        }
        displayErrorMessage(error.response.data.error);
    }
};

const createCryptoCard =  ({uuid, name, symbol, iconUrl}) => {
    const cardHolderDom = document.createElement('div');
    const imgDom = document.createElement('img');
    const symbolDom = document.createElement('h3');
    const cardDom = document.createElement('div');
    const nameDom = document.createElement('h3');

    cardDom.classList.add('card-crypto');
    nameDom.innerText = name;
    imgDom.src = iconUrl;
    symbolDom.innerText = symbol;

    cardDom.setAttribute('data-id', uuid);

    cardDom.append(imgDom, symbolDom, nameDom);
    cardHolderDom.append(cardDom);
    return cardHolderDom;
}



// Displays Error Message for short time.
const displayErrorMessage = (errorMessage) => {
    userMessage.classList.remove('hidden');
    userMessage.children[0].innerText = errorMessage
    const timer = setTimeout(() => {
        userMessage.children[0].innerText = '';
        userMessage.classList.add('hidden');
        clearInterval(timer);
    }, 2000);
}

// Events Listeners 

// Nav Event Listeners


// Form Event Listeners
formLogin.addEventListener('submit', handleFormLogin);
formSignup.addEventListener('submit', handleFormSignup);
formSearch.addEventListener('submit', handleFormSearch);
// Button Event Listeners
btnToSignup.addEventListener('click',() => showModal(modalSignup));
btnToLogin.addEventListener('click',() => showModal(modalLogin));


// Miscaellenous Event Listeners
modalBackground.addEventListener('click', closeAllModals);



// On Load
authenticate();