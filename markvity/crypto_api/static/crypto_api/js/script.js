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
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#page2').style.display = 'none';
    document.querySelectorAll('button').forEach(button => {
        button.onclick = function() {
            show_page(this.dataset.page);
        }
    })

    document.querySelector('#trending').addEventListener('click', () => load_trending());
    document.querySelector('#search').addEventListener('click', () => load_search());
    document.querySelector('#all').addEventListener('click', () => load_all());
    document.querySelector('#calculate').addEventListener('click', () => load_calculate());

    load_trending();

})

function load_trending(){

    //    let head_arr = ['SNo.', 'Rank', 'Name', 'Symbol', 'Price', 'Market', 'Cap'];

    document.querySelector('#content').innerHTML = 
        `<h1>Trending Crypto</h1><table>
        <tr>
            <th>SNo.</th>
            <th>Rank</th>
            <th>Name</th>
            <th>Symbol</th>
            <th>Price</th>
            <th>Market Cap</th>
        </tr></table>`;
    fetchWithRetry('http://api.coincap.io/v2/assets?limit=10', 10).then(function (json) {
        data = json;
        for (let i = 0; i < data.data.length; i++){
            const num1 = data.data[i].priceUsd;
            const num2 = data.data[i].marketCapUsd;
            document.querySelector('#content').innerHTML += 
                `<div><table>
                <tr>
                    <td>${i}</td>
                    <td>${data.data[i].rank}</td>
                    <td>${data.data[i].name}</td>
                    <td>${data.data[i].symbol}</td>
                    <td>${convertToInternationalCurrencySystem(Math.round(num1*10000)/10000)}$</td>
                    <td>${convertToInternationalCurrencySystem(num2)}$</td>
                </tr></table></div>`
        }
    })
    .catch(function (err) {
        console.log(`There was a problem with the fetch operation: ${err.message}`);
    })
}

function load_search(){
    document.querySelector('#content').innerHTML = '<h1> Search</h1>';
}

function load_all(){
    document.querySelector('#content').innerHTML = '<h1>All Crypto</h1>';
}

function load_calculate(){
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