// Body 
const body = document.querySelector('body');

// Chart
const canvas =  document.getElementById('crypto-chart');
const ctx = canvas.getContext('2d');

const apiLink = 'http://localhost:3001'
// State
let isLoggedIn = null;
let allCryptos = null;
let user = null;
let buttonTransactionState = null;
let myChart = null;

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
const modalChart = document.getElementById('modal-chart');

// Forms
const formLogin = document.getElementById('form-login');
const formSignup = document.getElementById('form-signup');
const formSearch = document.getElementById('form-search');
const formBuySelect = document.querySelector('#form-buy select');
const formSellSelect = document.querySelector('#form-sell select');
const formBuy = document.querySelector('#form-buy');
const formBuyDollarInput = document.querySelector('#form-buy input[type="number"]');
const formSell = document.getElementById('form-sell');

// Buttons
const btnToLogin = document.getElementById('btn-to-login');
const btnToSignup = document.getElementById('btn-to-signup');
const btnSellAll = document.querySelector('#form-sell input[name="sell-all"]');
const btnSell = document.querySelector('#form-sell input[name="sell"]')
const btnBuyAll = document.querySelector('#form-buy input[name="buy-all"]');
const btnBuy = document.querySelector('#form-buy input[name="buy"]')

// Else
const userMessage = document.getElementById('user-message');
const resultsSearch = document.getElementById('results-search');
const allCryptosHolder = document.getElementById('all-cryptos-holder');
const userCryptosTable = document.getElementById('user-cryptos-table-holder');
const tradeBalanceHolder = document.getElementById('balance-holder-trade');
const dashboardBalanceHolder = document.getElementById('balance-holder-dashboard');
const sidebarOne = document.getElementById('sidebar-one');
const dashboardContainerOne = document.getElementById('dashboard-container-one');
const loaderOneFull = document.getElementById('absolute-loader-holder');
const loaderTwoFull = document.getElementById('absolute-loader-holder-two');

// Show Section
const showSection = (section) => {
    allSections.forEach(s => s.classList.add('hidden'));
    section.classList.remove('hidden');
}


// Show Modal

const showModal = (modal) => {
    allModals.forEach(m => m.classList.add('hidden'));
    modal.classList.remove('hidden');
    const currentPos = parseInt(document.documentElement.scrollTop);
    modal.style.top = (currentPos + 170) + 'px';
    modalBackground.classList.remove('hidden');
}


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


// Change NavBar depending on login state and add event listeners to each of the nav links.
const changeNavBar = () => {
    removeAllChildNodes(navContainer);
    const navAllCryptos = document.createElement('span');
    const navSearch = document.createElement('span');

   
    navAllCryptos.innerText = 'All Cryptos';
    navSearch.innerText = 'Search';
    navSearch.addEventListener('click', () => showSection(searchSection));
    navAllCryptos.addEventListener('click', async () => {
        if (allCryptos !== null ) {
            showFullLoader(loaderTwoFull);
            hideAllSections();
            await loadAllCryptos();
            showSection(allCryptosSection);
            hideFullLoader(loaderTwoFull);
            displayTable(allCryptos, allCryptosHolder, [{'rank': 'Rank'},{'name': 'Name'}, {'symbol':'Symbol'},{'price': 'Price'}, {'marketCap': 'Market Cap'}], 'all-cryptos-table');
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

        navDashboard.addEventListener('click', async () => {
            showFullLoader(loaderTwoFull);
            hideAllSections();
            await loadAllCryptos();
            await loadAllUserInfo();
            showSection(dashboardSection);
            hideFullLoader(loaderTwoFull);
            displayTable(user.cryptos, dashboardContainerOne, [{'name': 'Name'}, {'amount': 'Amount'}, {'estimatedPrice': 'Estimated Value'}], 'user-cryptos-table');
            displayBalanceContainer(dashboardBalanceHolder);
            displayWelcomeCard(sidebarOne);
        });

        navTrade.addEventListener('click', async () => {
            showFullLoader(loaderTwoFull);
            hideAllSections();
            await loadAllCryptos();
            await loadAllUserInfo();
            showSection(tradeSection);
            hideFullLoader(loaderTwoFull);
            displayBalanceContainer(tradeBalanceHolder);
            displayTable(user.cryptos, userCryptosTable, [{'name': 'Name'}, {'amount': 'Amount'}, {'estimatedPrice': 'Estimated Value'}], 'user-cryptos-table');
            generateSelectOptions(formSellSelect, user.cryptos);
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
        hideFullLoader(loaderTwoFull);
        displayErrorMessage(response.data.error);
    }
};

//Load all User Cryptos
const loadAllUserInfo = async () => {
 
    try {
        const response   = await axios.get(`${apiLink}/users/cryptos`, {
            headers: {
                userToken: localStorage.getItem('userToken')
            }
        });

        if (response.data.message = 'ok') {
            user = {};
            user.username = response.data.username;
            user.balance = response.data.balance;
            user.startBalance = response.data.startBalance;

            user.cryptos = response.data.userCryptos.map(c => {
                const {name, symbol, image, userCrypto, crypto_id} = c;
                
                console.log(crypto_id);


                const price = allCryptos.find(c => c.uuid === crypto_id).price;

               
                const estimatedPrice = convertCryptoToPrice(userCrypto.amount, price);
                
                return {
                    name,
                    cryptoId: crypto_id,
                    amount: userCrypto.amount,
                    image,
                    symbol,
                    estimatedPrice,
                }
            });
        }
      
    } 
    catch(error) {
        console.log(error);
        displayErrorMessage(response.data.error);
        hideFullLoader(loaderTwoFull);
    }
}


const displayTable = (cryptos, parent, props, classStyle) => {
    removeAllChildNodes(parent);
 
    if (cryptos.length === 0) {
        const placeHolder = document.createElement('div');
        placeHolder.innerText = "You don't have any crypto coins.";
        parent.append(placeHolder);
        return
    }

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    const tbody = document.createElement('tbody');

    table.classList.add(classStyle);
 
    props.forEach(obj => {
        const [value] = Object.values(obj);
        const th = document.createElement('th');
        th.innerText = value;
        tr.append(th);
    });
    thead.append(tr);

    cryptos.forEach(crypto => {
        const tr = document.createElement('tr');
        props.forEach(obj => {
            const [prop] = Object.keys(obj);
            const td = document.createElement('td');
            const div = document.createElement('div');
            if (prop === 'name' && (crypto['iconUrl'] || crypto['image']) ) {
                const img = document.createElement('img');
                img.src = crypto['iconUrl'] || crypto['image'];
                div.append(img);

                div.addEventListener('click', async() => {
                    const cryptoId = crypto['uuid'] || crypto['cryptoId'];
                    getHistory(cryptoId, crypto[prop]);
                });
                div.classList.add('table-col-div');

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

const getHistory = async (id, name) => {
    try {
        showFullLoader(loaderTwoFull);
        const response = await axios.get(`${apiLink}/cryptos/${id}/history?timePeriod=1y`);
        const { formattedHistory } = response.data;
        loadChart(formattedHistory, name);
        hideFullLoader(loaderTwoFull);
    }
    catch(error) {
        console.log(error);
    }
}


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

       showFullLoader(loaderOneFull);

       const response = await axios.post(`${apiLink}/users/login`, formParams);
       const {userToken, message} = response.data;
       if (message === 'ok') {
           localStorage.setItem('userToken', userToken);
           await authenticate();
           hideFullLoader(loaderOneFull);
           usernameInput.value = '';
           passwordInput.value = '';
           closeAllModals();
       }

    }
    catch({response}) {
        hideFullLoader(loaderOneFull);
        displayErrorMessage(response.data.error);
    }
}

const handleFormSignup = async event => {
    event.preventDefault();
    showFullLoader(loaderOneFull);
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
            balance: balance.value,
            startBalance: balance.value,
        };

        const response = await axios.post(`${apiLink}/users`, formParams);

        const { userToken, message } = response.data;
        if (message === 'ok') {
            localStorage.setItem('userToken', userToken);
            await authenticate();
            hideFullLoader(loaderOneFull);
            username.value = '';
            email.value = '';
            passwordOne.value = '';
            passwordTwo.value = '';
            balance.value = '';
            closeAllModals();
        }


    }
    catch(error) {
        console.log(error.response);
        hideFullLoader(loaderOneFull);
        if (error.response == undefined ) {
            displayErrorMessage(error.message);
          
        }
        else {
            displayErrorMessage(error.response.data.error);
          
        }
       
      
    }

}

const createConfirmOrder = (coinPrice, dollarAmount, totalAmount, symbol, type , cryptoId) => {
    removeAllChildNodes(modalTransaction); 
    const p = document.createElement('p');
    const confirmButton = document.createElement('button');
    const cancelButton = document.createElement('button');



    p.innerText = ` ${totalAmount} ${symbol} for  $${dollarAmount}.`;
    confirmButton.innerText = "Okay";
    cancelButton.innerText = 'Cancel';
    
    modalTransaction.append(p, confirmButton, cancelButton);
    confirmButton.addEventListener('click',() => processOrder(dollarAmount, totalAmount, type, cryptoId));

    cancelButton.addEventListener('click', () => closeAllModals());
}


const processOrder = async (dollarAmount, coinAmount, type, cryptoId) => {
    try {
        
        const formParams = {
                cryptoId,
                dollarAmount,
                coinAmount,
                type
        };
        const response = await axios.put(`${apiLink}/users/cryptos`, formParams,  {
            headers: {
                userToken: localStorage.getItem('userToken')
            }
        });

        if (response.data.message = 'ok') {
            showFullLoader(loaderTwoFull);
            await loadAllCryptos();
            await loadAllUserInfo();
            hideFullLoader(loaderTwoFull);
            displayTable(user.cryptos, userCryptosTable, [{'name': 'Name'}, {'amount': 'Amount'}, {'estimatedPrice': 'Estimated Price'}], 'user-cryptos-table');
            displayBalanceContainer(tradeBalanceHolder);
            generateSelectOptions(formSellSelect, user.cryptos);
            closeAllModals();
        }

        
    }
    catch({response}) {
        displayErrorMessage(response.data.error);
    }
}


const displayBalanceContainer= parentNode => {
    removeAllChildNodes(parentNode);
    const div = document.createElement('div');
    const divChildOne = document.createElement('div');
    const subtitleOne = document.createElement('h3');
    const pOne = document.createElement('p');
    const divChildTwo = document.createElement('div');
    const subtitleTwo = document.createElement('h3');
    const pTwo= document.createElement('p');
    const divChildThree = document.createElement('div');
    const subtitleThree = document.createElement('h3');
    const pThree= document.createElement('p');
    
    div.classList.add('user-balance-container');
    subtitleOne.innerText = 'Balance';
    pOne.innerText = '$' + user.balance;
    subtitleTwo.innerText = 'Estimated Portfolio Value';
    subtitleThree.innerText = 'Start Balance';
    pThree.innerText = '$' + user.startBalance;

  
    const totalEstimatedPrice = user.cryptos.reduce((acc,curr) => {
        return acc + parseFloat(curr.estimatedPrice);
    }, parseFloat(user.balance)); 

    
    pTwo.innerText = `$${totalEstimatedPrice.toFixed(2)}`;
 
    divChildTwo.append(subtitleTwo, pTwo);
    divChildOne.append(subtitleOne, pOne);
    divChildThree.append(subtitleThree, pThree);

    div.append(divChildOne, divChildTwo, divChildThree);

    parentNode.append(div);
};


const handleFormBuy = async event => {
    event.preventDefault();

    try {
        
        if (buttonTransactionState === 'buy') {
            const [cryptoIdDom, dollarInputDom ] = event.target.elements;

            if (dollarInputDom.value === '') throw new Error('Dollar Amount cannot be empty!');

            const response = await axios.get(`${apiLink}/cryptos/${cryptoIdDom.value}`);
    
            const { coin } = response.data;
            
            const coinAmount = convertPriceToCrypto(dollarInputDom.value, coin.price);
            
            createConfirmOrder(coin.price, dollarInputDom.value, coinAmount, coin.symbol, 'buy', cryptoIdDom.value);
       
            dollarInputDom.value = '';
            
            showModal(modalTransaction);
        }

        else if (buttonTransactionState === 'buy-all') {
            const [cryptoIdDom ] = event.target.elements;

            const response = await axios.get(`${apiLink}/cryptos/${cryptoIdDom.value}`);
    
            const { coin } = response.data;

            const coinAmount = convertPriceToCrypto(user.balance, coin.price);

            createConfirmOrder(coin.price, user.balance, coinAmount, coin.symbol, 'buy', cryptoIdDom.value);

            
            showModal(modalTransaction);
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

const handleFormSell = async event => {
    event.preventDefault();

    try {
        if (buttonTransactionState === 'sell') {
            const [cryptoIdDom, coinAmountDom ] = event.target.elements;

            if  (coinAmountDom.value === '') throw new Error('Coin Amount cannot be Empty!');

            const response = await axios.get(`${apiLink}/cryptos/${cryptoIdDom.value}`);
    
            const { coin } = response.data;
            
            const totalPrice = convertCryptoToPrice(coinAmountDom.value, coin.price);
    
            createConfirmOrder(coin.price, totalPrice, coinAmountDom.value, coin.symbol, 'sell', cryptoIdDom.value);
            
            coinAmountDom.value = '';
        }   

        else if( buttonTransactionState === 'sell-all') {
            const [cryptoIdDom] = event.target.elements;

            const response = await axios.get(`${apiLink}/cryptos/${cryptoIdDom.value}`);
    
            const { coin } = response.data;
            
            const userAmount = user.cryptos.find(crypto => crypto.cryptoId === cryptoIdDom.value).amount;
          
            const totalPrice = convertCryptoToPrice(userAmount, coin.price);

            createConfirmOrder(coin.price, totalPrice, userAmount, coin.symbol, 'sell-all', cryptoIdDom.value);
        }
     

        showModal(modalTransaction);
       
    }
    catch(error) {
        if (error.message !== '') {
            displayErrorMessage(error.message);
            return;
        }
        displayErrorMessage(error.response.data.error);
       
    }
};

const convertPriceToCrypto = (dollarAmount, cryptoPrice) => {
    const pricePerDollar = 1 / parseFloat(cryptoPrice);

    const total = parseFloat(dollarAmount) * pricePerDollar;

    return total;
}

const convertCryptoToPrice = (cryptoAmount, dollarPrice) => {
    const total = parseFloat(cryptoAmount) * parseFloat(dollarPrice); 

    return total.toFixed(2);
} 

const handleFormSearch = async event => {
    event.preventDefault();
    const searchInput = event.target.elements[0];

    try {
        if (searchInput.value === '') throw new Error('Search Field Cannot Be Blank!');
        displayLoader(resultsSearch);
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
        removeAllChildNodes(resultsSearch); 
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

    cardDom.addEventListener('click', async (event) => {
        getHistory(uuid,name);
    });

    cardDom.append(imgDom, symbolDom, nameDom);
    cardHolderDom.append(cardDom);
    return cardHolderDom;
}

const loadChart = (history,name) => {
    if (myChart) myChart.destroy(); 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    showModal(modalChart);

    if (history.length > 60) {
        history = history.filter((h,i) => i % 3 === 0);    
    }
  
   
    const historyLabels = history.map(h => h.timestamp.split(',')[0]);
    const historyData = history.map(h => h.price);
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: historyLabels,
            datasets: [{
                label: `One Year Price Change ${name}`,
                data: historyData ,
                backgroundColor: [
                    'rgb(255,255,0)',
                
                ],
                borderColor: [
                    'rgb(0,0,0)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                },
            }
        }
    });

};

// Generate Options in Select
const generateSelectOptions = (selectParent, options) => {
    removeAllChildNodes(selectParent);
    options.forEach(o => {  
        const option = document.createElement('option');
        option.value = o['uuid'] || o['cryptoId'];
        option.innerText =` ${o['symbol']} (${o['name']})`;
        selectParent.append(option);
    });

    return; 
};

// Create Welcome Card
const displayWelcomeCard = (parentNode) => {
    removeAllChildNodes(parentNode);
    const div = document.createElement('div');
    div.classList.add('welcome-card');
    const h2 = document.createElement('h2');
    const bottomDiv = document.createElement('div');
    h2.innerText = `Welcome, ${user.username}`;
    const h3Title = document.createElement('h3');
    h3Title.innerText = 'Top Holdings';
    const ol = document.createElement('ol');
    const topHoldings = user.cryptos.sort((cOne,cTwo) => parseFloat(cTwo.estimatedPrice) - parseFloat(cOne.estimatedPrice)).slice(0,3);
    if (topHoldings.length) {
        topHoldings.forEach((holding, index) => {
            const li = document.createElement('li');
            const img = document.createElement('img');
            const span = document.createElement('span');
            const place = document.createElement('span');
            place.innerText = `${index + 1}.`;
            span.innerText = holding.symbol;
            img.src = holding.image;
            li.append(place,img,span);
            ol.append(li);
        });
    }
    else {
        ol.innerHTML = '<h3> No holdings! </h3>';
    }

    
    bottomDiv.append(h3Title,ol);
    div.append(h2, bottomDiv);
    parentNode.append(div);
}


const hideAllSections = () => {
    allSections.forEach(s => s.classList.add('hidden'));
}


const showFullLoader = (loader) => {

    const scrollPos = document.documentElement.scrollTop;

    loader.classList.remove('hidden');
};

const hideFullLoader = (loader) => {
    loader.classList.add('hidden');
}

const displayLoader = (parentNode) => {
    removeAllChildNodes(parentNode);
    const loaderDiv = document.createElement('div');
    loaderDiv.classList.add('relative-loader','lds-hourglass'); 

    parentNode.append(loaderDiv);
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

// Form Event Listeners
formLogin.addEventListener('submit', handleFormLogin);
formSignup.addEventListener('submit', handleFormSignup);
formSearch.addEventListener('submit', handleFormSearch);
formBuy.addEventListener('submit', handleFormBuy);
formSell.addEventListener('submit', handleFormSell);


// Button Event Listeners
btnToSignup.addEventListener('click',() => showModal(modalSignup));
btnToLogin.addEventListener('click',() => showModal(modalLogin));
btnSell.addEventListener('click', () => buttonTransactionState = 'sell');
btnBuy.addEventListener('click', () => buttonTransactionState = 'buy');
btnBuyAll.addEventListener('click', () => buttonTransactionState = 'buy-all');
btnSellAll.addEventListener('click', () => buttonTransactionState = 'sell-all');
// Miscaellenous Event Listeners
modalBackground.addEventListener('click', closeAllModals);



// On Load
showFullLoader(loaderOneFull);
loadAllCryptos()
    .then(()=> authenticate()) 
    .then(() => {
        hideFullLoader(loaderOneFull);
        generateSelectOptions(formBuySelect, allCryptos);
    });