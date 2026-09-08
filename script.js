// ==========================================================================
// Theme Switcher Logic
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const themeCheckbox = document.getElementById('checkbox');
    const htmlElement = document.documentElement;

    // Check saved theme in localStorage or system preferences
    const savedTheme = localStorage.getItem('ledok_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
        themeCheckbox.checked = savedTheme === 'dark';
    } else if (prefersDark) {
        htmlElement.setAttribute('data-theme', 'dark');
        themeCheckbox.checked = true;
    }

    // Toggle theme handler
    themeCheckbox.addEventListener('change', () => {
        if (themeCheckbox.checked) {
            htmlElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('ledok_theme', 'dark');
        } else {
            htmlElement.setAttribute('data-theme', 'light');
            localStorage.setItem('ledok_theme', 'light');
        }
    });

    // Initial calculation on page load
    calculateTotal();
});

// Product pricing mapping
const productPrices = {
    'kuskovoy': { name: 'Лед кусковой', price: 50 },
    'frappe': { name: 'Лед фраппе', price: 50 },
    'cheshuychatiy': { name: 'Лед чешуйчатый', price: 40 },
    'suhoy': { name: 'Сухой лед', price: 200 }
};

// ==========================================================================
// Calculator Logic & Order Links
// ==========================================================================
function calculateTotal() {
    const select = document.getElementById('iceType');
    const weightInput = document.getElementById('iceWeight');
    const typeLabel = document.getElementById('selectedTypeLabel');
    const weightLabel = document.getElementById('selectedWeightLabel');
    const totalPriceEl = document.getElementById('totalPrice');
    const btnTg = document.getElementById('btnOrderTg');
    const btnWa = document.getElementById('btnOrderWa');

    if (!select || !weightInput) return;

    let weight = parseInt(weightInput.value) || 1;
    if (weight < 1) {
        weight = 1;
        weightInput.value = 1;
    }

    const selectedProductKey = select.value;
    const product = productPrices[selectedProductKey] || productPrices['kuskovoy'];

    const total = product.price * weight;

    // Update UI text
    typeLabel.textContent = product.name;
    weightLabel.textContent = `${weight} кг`;
    totalPriceEl.textContent = `${total.toLocaleString('ru-RU')} ₽`;

    // Construct order message
    const orderMessage = `Здравствуйте! Хочу заказать лед в ЛедОк:\n- Тип: ${product.name}\n- Количество: ${weight} кг\n- Сумма: ${total} ₽`;
    const encodedMsg = encodeURIComponent(orderMessage);

    // Update Telegram and WhatsApp links
    btnTg.href = `https://t.me/Max_cloud?text=${encodedMsg}`;
    btnWa.href = `https://wa.me/79996945249?text=${encodedMsg}`;
}

function changeWeight(delta) {
    const weightInput = document.getElementById('iceWeight');
    if (!weightInput) return;
    let currentWeight = parseInt(weightInput.value) || 1;
    currentWeight += delta;
    if (currentWeight < 1) currentWeight = 1;
    weightInput.value = currentWeight;
    calculateTotal();
}

function selectProduct(typeKey) {
    const select = document.getElementById('iceType');
    if (select) {
        select.value = typeKey;
        calculateTotal();
        const calcSection = document.getElementById('calculator');
        if (calcSection) {
            calcSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
}
