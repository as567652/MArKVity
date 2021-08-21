let starting = 1;
let count = 20;

function show_page(page){
    if (page == 'page1'){
        document.querySelector(`#page1`).style.display = 'block';
        document.querySelector(`#page2`).style.display = 'none';
    }
    else if (page == 'page2'){
        document.querySelector(`#page2`).style.display = 'block';
        document.querySelector(`#page1`).style.display = 'none';
    }
}

document.addEventListener('click', event => {
    const element = event.target;
    if (element.id === 'more_info') {
        const val = element.dataset.button_id
        fetchWithRetry(`http://api.coincap.io/v2/assets?search=${val}`, 10).then(function (json) {
            data = json;
            document.querySelector("#popup").style.display = "block";
            document.querySelector("#popup_header").innerHTML = `
                <span id="close">&times;</span>
                <h2>${data.data[0].name}</h2>`
            document.querySelector("#popup_body").innerHTML = `
            <h3>Rank :- </h3><p>${data.data[0].rank}</p>
            <h3>Symbol :- </h3><p>${data.data[0].symbol}</p>
            <h3>Name :- </h3><p>${data.data[0].name}</p>
            <h3>Availaible Supply :- </h3><p>${data.data[0].supply}</p>
            <h3>Total Quantity Of Asset Issued) :- </h3> <p>${data.data[0].maxSupply}</p>
            <h3>MarketCap :- </h3><p>${data.data[0].marketCapUsd}</p>
            <h3>Volume Last 24Hr :- </h3><p>${data.data[0].volumeUsd24Hr}</p>
            <h3>Price :- </h3><p>${data.data[0].priceUsd}</p>
            <h3>Change Percent In Last 24Hr :- </h3><p>${data.data[0].changePercent24Hr}</p>
            <h3>Volume Weighted Average Price in the last 24 hours :- </h3><p>${data.data[0].vwap24Hr}</p>
            `
        })
        .catch(function (err) {
            console.log(`There was a problem with the fetch operation: ${err.message}`);
        })
    }
    else if(element.id === 'close'){
        document.querySelector("#popup").style.display = "none";
    }
    else if(element.id === 'popup'){
        document.querySelector("#popup").style.display = "none";
    }
});


document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#page2').style.display = 'none';
    document.querySelector(`#trend`).style.display = 'none';
    document.querySelector(`#search`).style.display = 'none';
    document.querySelector(`#all`).style.display = 'none';
    document.querySelector(`#calculate`).style.display = 'none';

    document.querySelectorAll('button').forEach(button => {
        button.onclick = function() {
            show_page(this.dataset.page);
        }
    })

    document.querySelector('#trending_b').addEventListener('click', () => load_trending());
    document.querySelector('#search_b').addEventListener('click', () => load_search());
    document.querySelector('#all_b').addEventListener('click', () => load_all());
    document.querySelector('#calculate_b').addEventListener('click', () => load_calculate());

    load_trending();

    submit_button = document.querySelector('#submit');
    submit_button.disabled = true;  
    document.querySelector('#search_form').onkeyup = () => {
        if (document.querySelector('#searched_value').value.length == 0){
            submit_button.disabled = true;
        }
        else{
            submit_button.disabled = false;
        }    
    }
    document.querySelector('#search_form').onsubmit = function() {
        const search_keywd = document.querySelector('#searched_value').value;
        fetchWithRetry(`http://api.coincap.io/v2/assets?search=${search_keywd}`, 10).then(function (json) {
        data = json;
            console.log(data);
            if (data.data.length == 0){

            }
            else{
                addTable(data, 'search_table', true);
            }
            document.querySelector('#searched_value').value = ""
            submit_button.disabled = true;
        })
        .catch(function (err) {
            console.log(`There was a problem with the fetch operation: ${err.message}`);
        })
        return false
    }
})


function load_trending(){
    starting = 1;

    document.querySelector(`#trend`).style.display = 'block';
    document.querySelector(`#search`).style.display = 'none';
    document.querySelector(`#all`).style.display = 'none';
    document.querySelector(`#calculate`).style.display = 'none';

    fetchWithRetry('http://api.coincap.io/v2/assets?limit=10', 10).then(function (json) {
        data = json;
        addTable(data, 'trending_table', true);
    })
    .catch(function (err) {
        console.log(`There was a problem with the fetch operation: ${err.message}`);
    })
}

function load_search(){
    document.querySelector(`#trend`).style.display = 'none';
    document.querySelector(`#search`).style.display = 'block';
    document.querySelector(`#all`).style.display = 'none';
    document.querySelector(`#calculate`).style.display = 'none';
}

function load_all(){
    document.querySelector(`#trend`).style.display = 'none';
    document.querySelector(`#search`).style.display = 'none';
    document.querySelector(`#all`).style.display = 'block';
    document.querySelector(`#calculate`).style.display = 'none';

    fetchWithRetry(`http://api.coincap.io/v2/assets?limit=${count}&offset=${starting - 1}`, 10).then(function (json) {
        data = json;
        addTable(data, 'all_table', false);
        starting += count;
        window.onscroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
                load_all();
            }
        };
    })
    .catch(function (err) {
        console.log(`There was a problem with the fetch operation: ${err.message}`);
    })
}

function load_calculate(){
    starting = 1;

    document.querySelector(`#trend`).style.display = 'none';
    document.querySelector(`#search`).style.display = 'none';
    document.querySelector(`#all`).style.display = 'none';
    document.querySelector(`#calculate`).style.display = 'block';

    document.querySelector('#content').innerHTML = '<h1>Calculate Value</h1>';
}

function fetchWithRetry(url, retryLimit, retryCount) {
    retryLimit = retryLimit || Number.MAX_VALUE;
    retryCount = Math.max(retryCount || 0, 0);
    return fetch(url).then(function (res) {
        console.log(res.status);
        if (res.status !== 200 && retryCount < retryLimit) {
            console.log("There was an error processing your fetch request. We are trying again.");
            return fetchWithRetry(url, retryLimit, retryCount + 1);
        } else {
            return res.json();
        }
    });
}
function convertToInternationalCurrencySystem (labelValue) {
    // Nine Zeroes for Billions
    return Math.abs(Number(labelValue)) >= 1.0e+9
    ? (Math.abs(Number(labelValue)) / 1.0e+9).toFixed(2) + "B"
    // Six Zeroes for Millions 
    : Math.abs(Number(labelValue)) >= 1.0e+6
    ? (Math.abs(Number(labelValue)) / 1.0e+6).toFixed(2) + "M"
    // Three Zeroes for Thousands
    : Math.abs(Number(labelValue)) >= 1.0e+3
    ? (Math.abs(Number(labelValue)) / 1.0e+3).toFixed(2) + "K"
    : Math.abs(Number(labelValue));
}

function addTable(data, id, empty){
    var tabl = document.getElementById(id);
    const l = document.getElementsByTagName('tr').length;
    
    if (empty == true || starting == 1){
        tabl.innerHTML = `
        <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Symbol</th>
            <th>Price</th>
            <th>Market Cap</th>
            <th>Options</th>
        </tr>
        `;    
    }
    for (let i = 0; i < data.data.length; i++){

        const num1 = convertToInternationalCurrencySystem(Math.round(data.data[i].priceUsd*10000)/10000);
        const num2 = convertToInternationalCurrencySystem(data.data[i].marketCapUsd);

        let arr = [data.data[i].rank, data.data[i].name, data.data[i].symbol, num1 + `$`, num2 + `$`];

        var row = tabl.insertRow(-1);
        for (let j = 0; j < arr.length; j++){
            row.innerHTML += `
                <td>${arr[j]}</td>
            `;
        }

        var cell = row.insertCell(5);
        cell.innerHTML = `<button data-button_id = ${data.data[i].id} id = "more_info">More Info</button>`;
    }
}