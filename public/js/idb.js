// offline persistance for deposits expenses
// add desposits expenses to transaction history and update total

// variable to hold db connection
let db;

const request = indexedDB.open('budget',1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_transaction', { autoIncrement: true });// new_transaction being the name of our object store
};

request.onsuccess = function(event) {
    db = event.target.result;
    if(navigator.onLine) {
        uploadTransactionData();
    };
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

// saves data to indexedDB when there is no internet connection available
function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite');// open transaction
    const dataObjectStore = transaction.objectStore('new_transaction');// access object store via transaction
    dataObjectStore.add(record);
}

function uploadTransactionData() {
    const transaction = db.transaction(['new_transaction'],'readwrite');
    const dataObjectStore = transaction.objectStore('new_transaction', 'readwrite')
    
    const getAll = dataObjectStore.getAll();
    console.log('uploading');
    getAll.onsuccess = function() {
        if(getAll.result.length>0){
            fetch('/api/transaction', {
                method:'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if(serverResponse.message){
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(['new_transaction'], 'readwrite');// open one more transation
                const dataObjectStore = transaction.objectStore('new_transaction');// access the new_pizza object store
                // clear all items in your store
                dataObjectStore.clear();
            })
            .catch(err => {
                console.log(err)
            });


        }
    };
}

window.addEventListener('online', uploadTransactionData);