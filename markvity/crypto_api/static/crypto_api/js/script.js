let starting = 1;
let count = 20;
search_init = false
let current_page_id = 'page1'
let continue_load = true

function show_msg_on_table(){
    parent = document.getElementById(current_page_id)
    child = parent.querySelectorAll('#extra_content')[0];
    if (current_page_id == 'search'){
        child.innerHTML = "Your search result will appear here : )"
    }
    else if (current_page_id == 'calculate'){
        child.innerHTML = "Your conversion will appear here : )"
    }
    else{
        child.innerHTML = "Please wait while we load data for you : )"
    }
}

function hide_msg_on_table(){
    parent = document.getElementById(current_page_id)
    child = parent.querySelectorAll('#extra_content')[0];
    child.innerHTML = ""
}

function remove_table_content(id){
    var tabl = document.getElementById(id);
    let L = tabl.querySelectorAll('tr').length
    for (let i = L - 1; i > 0; i--){
        tabl.deleteRow(i);
    }
}

function start_loader(idd){
    parent = document.getElementById(idd);
    child = parent.querySelectorAll('.loader')[0];
    child.style.display = "block";
}
function stop_loader(idd){
    parent = document.getElementById(idd);
    child = parent.querySelectorAll('.loader')[0];
    child.style.display = "none";
}

function show_div(name){
    current_page_id = name
    document.querySelectorAll('.main_class').forEach(div => {
        div.style.display = 'none';
    })
    if (name === 'page1'){
        document.querySelector(`#footer`).style.display = 'block';
        document.querySelector(`#page2`).style.display = 'none';
        document.querySelector(`#page1`).style.display = 'block';
    }
    else {
        document.querySelector(`#footer`).style.display = 'none';
        document.querySelector(`#page2`).style.display = 'block';
        document.querySelector(`#page1`).style.display = 'none';
    }
    document.querySelector(`#${name}`).style.display = 'block';
}

document.addEventListener('DOMContentLoaded', function() {
    show_div('page1');

    window.onscroll = () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight && current_page_id == 'all' && continue_load == true) {
            load_all();
            continue_load = false
            setTimeout(function() {continue_load = true;}, 1000);
        }
    };

    submit_button = document.querySelector('#search_submit');
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
        search_init = true
        if (search_init == true){
            start_loader('search');
        }
        const search_keywd = document.querySelector('#searched_value').value;
        fetchWithRetry(`http://api.coincap.io/v2/assets?search=${search_keywd}`, 10).then(function (json) {
        data = json;
            console.log(data);
            if (data.data.length != 0){
                addTable(data, 'search_table', true);
            }
            document.querySelector('#searched_value').value = ""
            submit_button.disabled = true;
            stop_loader('search');
        })
        .catch(function (err) {
            console.log(`There was a problem with the fetch operation: ${err.message}`);
        })
        return false
    }
    c_submit_button = document.querySelector('#calculate_submit');
    c_submit_button.disabled = true;  
    document.querySelector('#calculate_form').onkeyup = () => {
        if (document.querySelector('#crypto_form').value.length == 0 && document.querySelector('#cash_form').value.length == 0){
            c_submit_button.disabled = true;
        }
        else{
            c_submit_button.disabled = false;
        }    
    }
    document.querySelector('#calculate_form').onsubmit = function() {
        var regExp = /\(([^)]+)\)/;
        var matches = regExp.exec(document.querySelector('#crypto_form').value);

        var cryp
        var ans
        var cash = document.querySelector('#cash_form').value
        search_init = true
        document.querySelector('#crypto_form').value = ""
        document.querySelector('#cash_form').value = ""
        if (search_init == true){
            start_loader('calculate');
        }
        fetchWithRetry(`http://api.coincap.io/v2/assets?search=${matches[1]}`, 10).then(function (json) {
            data = json;
            cryp = Math.abs(data.data[0].priceUsd).toFixed(2)
            fetch(`https://api.frankfurter.app/latest?amount=${cryp}&from=USD&to=${cash}`)
            .then(response => {
                return response.json()
            })
            .then(rates => {
                for(var key in rates.rates) {
                    hide_msg_on_table()
                    ans = rates.rates[key];
                    document.querySelector('#calculate_result').innerHTML = `
                    <h3>1 ${data.data[0].symbol} = ${ans} ${cash}</h3>`;
                }
            })
            stop_loader('calculate')
        })
        .catch(function (err) {
            console.log(`There was a problem with the fetch operation: ${err.message}`);
        })
        return false
    }
})


document.addEventListener('click', event => {
    const element = event.target;
    if (element.id === 'more_info') {
        const val = element.dataset.button_id
        fetchWithRetry(`http://api.coincap.io/v2/assets?search=${val}`, 10).then(function (json) {
            data = json;
            tmp = document.getElementById('content');
            tmp.classList.remove('animate_reverse');
            tmp.classList.add('animate_forward');
            document.querySelector("#popup").style.display = "block";
            document.querySelector("#popup_header").innerHTML = `
                <span id="close">&times;</span>
                <h1 class="page_header"><i>${data.data[0].name}</i></h1>`
            var num = parseInt(parseFloat(data.data[0].changePercent24Hr) * 100) / 100;
            document.querySelector("#popup_body").innerHTML = `
            <div id = "popup_table">
                <table>
                    <tbody>
                        <tr>
                            <td>Global Rank (Market Cap)</td>
                            <td>${data.data[0].rank}</td>
                        </tr>
                        <tr>
                            <td>Symbol Used</td>
                            <td>${data.data[0].symbol}</td>
                        </tr>
                        <tr>
                            <td>Price (Based on real-time market data)</td>
                            <td>$ ${convertToInternationalCurrencySystem(data.data[0].priceUsd)}</td>
                        </tr>
                        <tr>
                            <td>Available supply for trading</td>
                            <td>${convertToInternationalCurrencySystem(data.data[0].supply)} units</td>
                        </tr>
                        <tr>
                            <td>Total Quantity Of Asset Issued</td>
                            <td>${convertToInternationalCurrencySystem(data.data[0].maxSupply)} units</td>
                        </tr>
                        <tr>
                            <td>Market Cap (supply x price)</td>
                            <td>$ ${convertToInternationalCurrencySystem(data.data[0].marketCapUsd)}</td>
                        </tr>
                        <tr>
                            <td>Quantity of trading volume represented in USD over the last 24 hours</td>
                            <td>$ ${convertToInternationalCurrencySystem(data.data[0].volumeUsd24Hr)}</td>
                        </tr>
                        <tr>
                            <td>Change Percent In Last 24Hr</td>
                            <td>${num} %</td>
                        </tr>
                        <tr>
                            <td>Volume Weighted Average Price in the last 24 hours</td>
                            <td>$ ${convertToInternationalCurrencySystem(data.data[0].vwap24Hr)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>    
            `
            document.querySelector('#popup_foot').innerHTML = `
                <div id = "ppp">
                    Based On Data provided by <a target =  '_blank' href = "https://docs.coincap.io/">CoinCap</a> API
                </div>
            `
        })
        .catch(function (err) {
            console.log(`There was a problem with the fetch operation: ${err.message}`);
        })
    }
    else if(element.id === 'close'){
        tmp = document.getElementById('content');
        tmp.classList.remove('animate_forward');
        tmp.classList.add('animate_reverse');
        setTimeout(function() {document.querySelector("#popup").style.display = "none";}, 800);
    }
    else if(element.id === 'popup'){
        document.querySelector("#popup").style.display = "none";
    }
    else if (element.id === 'go_to_home_page'){
        show_div('page1')
        load_trending()
        window.scrollTo(0, 0);
    }
    else if (element.id === 'go_to_trending_page'){
        show_div('trend')
        load_trending()
        window.scrollTo(0, 0);
    }
    else if (element.id === 'go_to_search_page'){
        show_div('search')
        load_search()
        window.scrollTo(0, 0);
    }
    else if (element.id === 'go_to_all_page'){
        remove_table_content('all_table')
        starting = 1
        show_div('all')
        load_all()
        window.scrollTo(0, 0);
    }
    else if (element.id === 'go_to_calculate_page'){
        document.querySelector('#calculate_result').innerHTML = ""
        show_div('calculate')
        load_calculate()
        window.scrollTo(0, 0);
    }
});


function load_trending(){
    remove_table_content('trending_table')
    starting = 1;
    start_loader('trend')
    show_msg_on_table()
    document.querySelector(`#trend`).style.display = 'block';
    document.querySelector(`#search`).style.display = 'none';
    document.querySelector(`#all`).style.display = 'none';
    document.querySelector(`#calculate`).style.display = 'none';

    fetchWithRetry('http://api.coincap.io/v2/assets?limit=10', 10).then(function (json) {
        data = json;
        addTable(data, 'trending_table', true);
        stop_loader('trend')
    })
    .catch(function (err) {
        console.log(`There was a problem with the fetch operation: ${err.message}`);
    })
}

function load_search(){
    remove_table_content('search_table')
    search_init = false
    show_msg_on_table()
    document.querySelector(`#trend`).style.display = 'none';
    document.querySelector(`#search`).style.display = 'block';
    document.querySelector(`#all`).style.display = 'none';
    document.querySelector(`#calculate`).style.display = 'none';
}

function load_all(){
    start_loader('all')
    show_msg_on_table();
    document.querySelector(`#trend`).style.display = 'none';
    document.querySelector(`#search`).style.display = 'none';
    document.querySelector(`#all`).style.display = 'block';
    document.querySelector(`#calculate`).style.display = 'none';
    console.log(starting)
    fetchWithRetry(`http://api.coincap.io/v2/assets?limit=${count}&offset=${starting - 1}`, 10).then(function (json) {
        data = json;
        addTable(data, 'all_table', false);
        starting += count;
        stop_loader('all')
    })
    .catch(function (err) {
        console.log(`There was a problem with the fetch operation: ${err.message}`);
    })
}

function load_calculate(){
    show_msg_on_table()
    search_init = true
    starting = 1;
    let crypto_names = []
    let curr_names = []
    document.querySelector(`#trend`).style.display = 'none';
    document.querySelector(`#search`).style.display = 'none';
    document.querySelector(`#all`).style.display = 'none';
    document.querySelector(`#calculate`).style.display = 'block';


    fetchWithRetry(`http://api.coincap.io/v2/assets?limit=2000`, 10).then(function (json) {
        data = json;
        for (let i = 0; i < 2000; i++){
            crypto_names[i] = data.data[i].name + ' (' + data.data[i].symbol + ')';
        }
        for (let i = 0; i < 2000; i++){
            let tmp = document.createElement('option')
            tmp.value = crypto_names[i];
            document.querySelector('#cryp_l').append(tmp);
        }
    })
    .catch(function (err) {
        console.log(`There was a problem with the fetch operation: ${err.message}`);
    })

    fetch('https://api.frankfurter.app/latest?base=USD')
    .then(response => {
        return response.json()
    })
    .then(rates => {
        curr_names = Object.keys(rates.rates)
        for (let i = 0; i < 32; i++){
            let tmp = document.createElement('option')
            tmp.value = curr_names[i];
            document.querySelector('#cash_l').append(tmp);
        }
    })
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
    ? (Math.abs(Number(labelValue)) / 1.0e+9).toFixed(2) + " Bn"
    // Six Zeroes for Millions 
    : Math.abs(Number(labelValue)) >= 1.0e+6
    ? (Math.abs(Number(labelValue)) / 1.0e+6).toFixed(2) + " Mn"
    // Three Zeroes for Thousands
    //: Math.abs(Number(labelValue)) >= 1.0e+3
    //? (Math.abs(Number(labelValue)) / 1.0e+3).toFixed(2) + "K"
    : parseInt(Number(labelValue) * 1000) / 1000;
}

function addTable(data, id, empty){
    hide_msg_on_table()
    var tabl = document.getElementById(id);
    const l = document.getElementsByTagName('tr').length;
    

    for (let i = 0; i < data.data.length; i++){

        const num1 = convertToInternationalCurrencySystem(Math.round(data.data[i].priceUsd*10000)/10000);
        const num2 = convertToInternationalCurrencySystem(data.data[i].marketCapUsd);

        let arr = [data.data[i].rank, data.data[i].name, data.data[i].symbol, `$ ` + num1, `$ ` + num2 ];

        var row = tabl.insertRow(-1);
        for (let j = 0; j < arr.length; j++){
            row.innerHTML += `
                <td>${arr[j]}</td>
            `;
        }

        var cell = row.insertCell(5);
        cell.innerHTML = `
            <div id="container">
                <div class="button" id="button_responsive">
                <div id="translate"></div>
                <a data-button_id = ${data.data[i].id} id = "more_info">More Info</a>
            </div>
        `;
    }
}