// Body 
const body = document.querySelector('body');

// Sections
const allSections = document.querySelectorAll('section');
const searchSection = document.getElementById('section-search');
const dashboardSection = document.getElementById('section-dashboard');
const tradeSection = document.getElementById('section-trade');
const allCryptosSection = document.getElementById('section-all-cryptos');

// NavLinks
const navLogin = document.getElementById('nav-login');
const navSignup = document.getElementById('nav-signup');

// Modals
const allModals = document.querySelectorAll('.modal');
const modalSignup = document.getElementById('modal-signup');
const modalLogin = document.getElementById('modal-login');
const modalBackground = document.getElementById('modal-background');

// Forms
const formLogin = document.getElementById('form-login');
const formSignup = document.getElementById('form-signup');

// Buttons
const btnToLogin = document.getElementById('btn-to-login');
const btnToSignup = document.getElementById('btn-to-signup');


const showModal = (modal) => {
    console.log('test');
    allModals.forEach(m => m.classList.add('hidden'));
    modal.classList.remove('hidden');
    modalBackground.classList.remove('hidden');
};

const closeAllModals = () => {
    modalBackground.classList.add('hidden');
    allModals.forEach(m => m.classList.add('hidden'));
}


// Event Handlers
const handleFormLogin = event => {
    event.preventDefault();

}

const handleFormSignup = event => {
    event.preventDefault();
}


// Events Listeners 

// Nav Event Listeners
navLogin.addEventListener('click' ,() => showModal(modalLogin));
navSignup.addEventListener('click' ,() => showModal(modalSignup));

// Form Event Listeners
formLogin.addEventListener('submit', handleFormLogin);
formSignup.addEventListener('submit', handleFormSignup);
// Button Event Listeners
btnToSignup.addEventListener('click',() => showModal(modalSignup));
btnToLogin.addEventListener('click',() => showModal(modalLogin));

// Miscaellenous Event Listeners
modalBackground.addEventListener('click', closeAllModals);
