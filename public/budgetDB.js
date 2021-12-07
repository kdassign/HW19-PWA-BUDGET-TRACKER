let db;
let budgetVersion;


const request = indexedDB.open("budgetDB", budgetVersion || 42);




request.onupgradeneeded = function (event) {
  console.log('Upgrade needed in IndexedDB');

  const { oldVersion } = event;
  const newVersion = event.newVersion || db.version;

  console.log(`DB updated from version ${oldVersion} to ${newVersion}`);

  db = event.target.result;

  if (db.objectStoreNames.length === 0) {
    db.createObjectStore('BudgetStore', { autoIncrement: true });
  }

};

request.onerror = function (event) {
  console.log(`Whoops! ${event.target.errorCode}`);
};

function checkDatabase() {
    console.log('Check DB Invoked');


    let transaction = db.transaction(['BudgetStore'], 'readwrite');

    const store = transaction.objectStore('BudgetStore');

    const getAll = store.getAll();


    getAll.onsuccess = function () {

        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => response.json())
                .then((res) => {

                    if (res.length !== 0) {

                        transaction = db.transaction(['BudgetStore'], 'readwrite');

                        const currentStore = transaction.objectStore('BudgetStore');

                        currentStore.clear();
                        console.log('Clearing current store');
                    }
                });
        }
    };
};


request.onsuccess = function (event) {
    console.log('success');
    db = event.target.result;

    if (navigator.online) {
        console.log('Backend is online!');
        checkDatabase();
    }
};


const saveRecord = (record) => {
    console.log('Save Record Invoked');

    const transaction = db.transaction(['BudgetStore'], 'readwrite');


    const store = transaction.objectStore('BudgetStore');


    store.add(record);
};


window.addEventListener('online', checkDatabase);