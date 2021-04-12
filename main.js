// Body 
const body = document.querySelector('body');

const apiLink = 'http://localhost:3001'
// State
let currentSection = 'search';
let isLoggedIn = null;
let allCryptos = null;
let user = null;

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
const modalTransaction = document.getElementById('modal-transaction');

// Forms
const formLogin = document.getElementById('form-login');
const formSignup = document.getElementById('form-signup');
const formSearch = document.getElementById('form-search');
const formBuySelect = document.querySelector('#form-buy select');
const formBuy = document.querySelector('#form-buy');
const formBuyDollarInput = document.querySelector('#form-buy input[type="number"]');

// Buttons
const btnToLogin = document.getElementById('btn-to-login');
const btnToSignup = document.getElementById('btn-to-signup');

// Else
const userMessage = document.getElementById('user-message');
const resultsSearch = document.getElementById('results-search');
const allCryptosHolder = document.getElementById('all-cryptos-holder');


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
    user = null;
    authenticate();
}

// Update Trade Section 

// Change NavBar depending on login state and add event listeners to each of the nav links.
const changeNavBar = () => {
    removeAllChildNodes(navContainer);
    const navAllCryptos = document.createElement('span');
    const navSearch = document.createElement('span');

   
    navAllCryptos.innerText = 'All Cryptos';
    navSearch.innerText = 'Search';
    navSearch.addEventListener('click', () => showSection(searchSection));
    navAllCryptos.addEventListener('click', async () => {
        showSection(allCryptosSection);
        if (allCryptos !== null ) {
            await loadAllCryptos();
            displayTable(allCryptos, allCryptosHolder, ['rank','name', 'symbol','price', 'marketCap'], 'all-cryptos-table');
        }
    });
    
    navContainer.append(navSearch, navAllCryptos);

    if (isLoggedIn) {
        const navTrade = document.createElement('span');
        const navDashboard = document.createElement('span');
        const navLogout = document.createElement('span');

        navLogout.innerText = 'Log Out';
        navDashboard.innerText = 'Dashboard';
        navTrade.innerText = 'Trade';

        navDashboard.addEventListener('click', () => showSection(dashboardSection));
        navTrade.addEventListener('click', async () => {
            await loadAllUserInfo();
            showSection(tradeSection);
        });
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

// Load All Cryptos
const loadAllCryptos = async () => {
    try {
        const response = await axios.get(`${apiLink}/cryptos`);
        const { cryptos } = response.data;
        allCryptos = cryptos;
    }
    catch({response}) {
    
        displayErrorMessage(response.data.error);
    }
};

//Load all User Cryptos
const loadAllUserInfo = async () => {
    try {
        const response = await axios.get(`${apiLink}/users/cryptos`, {
            headers: {
                userToken: localStorage.getItem('userToken')
            }
        });

        console.log(response.data);
        
        
    } 
    catch({response}) {
    
        displayErrorMessage(response.data.error);
    }
}


const displayTable = (cryptos, parent, props, classStyle) => {
    removeAllChildNodes(parent);
 
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    const tbody = document.createElement('tbody');

    table.classList.add(classStyle);
 
    props.forEach(prop => {
        const th = document.createElement('th');
        th.innerText = prop;
        tr.append(th);
    });
    thead.append(tr);

    cryptos.forEach(crypto => {
        const tr = document.createElement('tr');
        props.forEach(prop => {
            const td = document.createElement('td');
            const div = document.createElement('div');
            if (prop === 'name' && crypto['iconUrl']) {
                const img = document.createElement('img');
                img.src = crypto['iconUrl'];
                div.append(img);

                div.style.color = crypto['color'];

            }
            div.append(crypto[prop]);
            td.append(div);
            tr.append(td);
        });
        tbody.append(tr);
    });

    table.append(thead, tbody);
    
    parent.append(table);
};


// Authenticate User Check Token. Also Determines which navbar to load for the user.
const authenticate = async () => {
    const userToken = localStorage.getItem('userToken');
    if (userToken) {
        try {   
            const response = await axios.get(`${apiLink}/users/verify`,{
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
       const response = await axios.post(`${apiLink}/users/login`, formParams);
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

        const response = await axios.post(`${apiLink}/users`, formParams);
        const { userToken, message } = response.data;
        if (message === 'ok') {
            localStorage.setItem('userToken', userToken);
            authenticate();
            username.value = '';
            email.value = '';
            passwordOne.value = '';
            passwordTwo.value = '';
            balance.value = '';
            closeAllModals();
        }


    }
    catch(error) {
     
        if (error.message === '') {
           
            displayErrorMessage(error.message);
            return;
        }
       
        displayErrorMessage(error.response.data.error);
    }

}

const createConfirmOrder = (coinPrice, dollarAmount, totalAmount, symbol) => {
    removeAllChildNodes(modalTransaction); 
    const p = document.createElement('p');
    p.innerText = `You are buying ${totalAmount} ${symbol} for  $${dollarAmount}. (${1 / parseFloat(coinPrice)} per $1)`;
    modalTransaction.append(p);
    console.log('test');

}


const handleFormBuy = async event => {
    event.preventDefault();
    try {
        const [cryptoIdDom, dollarInputDom ] = event.target.elements;

        const response = await axios.get(`${apiLink}/cryptos/${cryptoIdDom.value}`);

        const { coin } = response.data;
        
        const coinAmount = convertPriceToCrypto(dollarInputDom.value, coin.price);
        
        createConfirmOrder(coin.price, dollarInputDom.value, coinAmount, coin.symbol);
        
        
        showModal(modalTransaction);
    }
    catch({response}) {
        displayErrorMessage(response.data.error);
    }
 
};

const convertPriceToCrypto = (dollarAmount, cryptoPrice) => {
    const pricePerDollar = 1 / parseFloat(cryptoPrice);

    const total = parseFloat(dollarAmount) * pricePerDollar;

    return total;
}

const handleFormSearch = async event => {
    event.preventDefault();
    const searchInput = event.target.elements[0];

    try {
        if (searchInput.value === '') throw new Error('Search Field Cannot Be Blank!');

        const response = await axios.get(`${apiLink}/cryptos?q=${searchInput.value}`);
        
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
     
        if (error.message !== '') {
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

// Generate Options in Select
const generateSelectOptions = (selectParent, options) => {
    removeAllChildNodes(selectParent);
    options.forEach(o => {  
        const option = document.createElement('option');
        option.value = o['uuid'];
        option.innerText =` ${o['symbol']} (${o['name']})`;
        selectParent.append(option);
    });

    return; 
};


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

// Form Event Listeners
formLogin.addEventListener('submit', handleFormLogin);
formSignup.addEventListener('submit', handleFormSignup);
formSearch.addEventListener('submit', handleFormSearch);
formBuy.addEventListener('submit', handleFormBuy);


// Button Event Listeners
btnToSignup.addEventListener('click',() => showModal(modalSignup));
btnToLogin.addEventListener('click',() => showModal(modalLogin));


// Miscaellenous Event Listeners
modalBackground.addEventListener('click', closeAllModals);



// On Load
loadAllCryptos().then(() => {
    generateSelectOptions(formBuySelect, allCryptos);
    authenticate();
});

