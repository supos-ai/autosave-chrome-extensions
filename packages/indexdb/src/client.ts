export default class Client {
  _dbs: Record<string, IDBDatabase>;
  _databaseName: string;
  currentStore: string;
  _databaseVersion: number;

  constructor(name: string, version: number, options?: any) {
    this._dbs = {};
    this._databaseName = name;
    this._databaseVersion = version;
    this.currentStore = "";

    if (!window.indexedDB) {
      throw new Error("浏览器不支持indexedDB");
    }
    this.open(name, version, options);
  }

  open(name: string, version: number, options?: any): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this._dbs && this._dbs[name]) {
        resolve(this._dbs[name]);
        return;
      }
      let request = window.indexedDB.open(name, version);
      request.onupgradeneeded = (event) => {
        let db = (event.target as any).result;
        this._dbs[name] = db;
        for (let i in options) {
          let store: IDBObjectStore;

          const isStoreExist = db.objectStoreNames.contains(
            options[i].storeName
          );

          if (isStoreExist) {
            store = (event?.target as any).transaction.objectStore(
              options[i].storeName
            );
          } else {
            store = db.createObjectStore(options[i].storeName, {
              keyPath: "id",
            });
          }

          for (let { name, keyPath, unique } of options[i].index) {
            if (!store.indexNames.contains(name)) {
              store.createIndex(name, keyPath, { unique });
            }
          }
        }
        resolve(db);
      };
      request.onsuccess = (event) => {
        const db = (event.target as any).result;
        this._dbs[name] = db;
        resolve(db);
      };
      request.onerror = (event) => {
        reject(event);
        console.error("IndexedDB", event);
      };
    });
  }

  async _getTransaction(storeName: string) {
    let db: IDBDatabase;
    if (this._dbs[this._databaseName]) {
      db = this._dbs[this._databaseName];
    } else {
      db = await this.open(this._databaseName, this._databaseVersion || 1);
    }
    return db.transaction([storeName], "readwrite");
  }

  async _getObjectStore(storeName: string) {
    let transaction = await this._getTransaction(storeName);
    return transaction.objectStore(storeName);
  }

  // 获取一个store
  collection(storeName: string) {
    this.currentStore = storeName;
    this._getObjectStore(storeName);
    return this;
  }

  async add(data: any) {
    const store = await this._getObjectStore(this.currentStore);
    const request = store.add(data);

    return new Promise((resolve, reject) => {
      request.onsuccess = function (event) {
        resolve((event.target as any).result);
      };
      request.onerror = (event) => {
        reject(event);
      };
    });
  }

  // get 使用id查询
  async get(data: any) {
    const store = await this._getObjectStore(this.currentStore);
    const request = store.get(data);

    return new Promise((resolve, reject) => {
      request.onsuccess = function (event) {
        resolve((event.target as any).result);
      };
      request.onerror = (event) => {
        reject(event);
      };
    });
  }

  async count() {
    const store = await this._getObjectStore(this.currentStore);
    const request = store.count();

    return new Promise((resolve, reject) => {
      request.onsuccess = function (event) {
        resolve((event.target as any).result);
      };
      request.onerror = (event) => {
        reject(event);
      };
    });
  }

  // delete(data) {
  //     return new Promise((resolve, reject) => {
  //         this._getObjectStore(this.currentStore).then((objectStore) => {
  //             const request = objectStore.delete(data);
  //             request.onsuccess = function (event) {
  //                 resolve(event.target.result);
  //             };
  //             request.onerror = (event) => {
  //                 reject(event);
  //             };
  //         });
  //     });
  // }

  // clear(data) {
  //     return new Promise((resolve, reject) => {
  //         this._getObjectStore(this.currentStore).then((objectStore) => {
  //             const request = objectStore.clear(data);
  //             request.onsuccess = function (event) {
  //                 resolve(event.target.result);
  //             };
  //             request.onerror = (event) => {
  //                 reject(event);
  //             };
  //         });
  //     });
  // }

  // put(data) {
  //     return new Promise((resolve, reject) => {
  //         this._getObjectStore(this.currentStore).then((objectStore) => {
  //             const request = objectStore.put(data);
  //             request.onsuccess = function (event) {
  //                 resolve(event.target.result);
  //             };
  //             request.onerror = (event) => {
  //                 reject(event);
  //             };
  //         });
  //     });
  // }

  async find(options: any) {
    const { cursor, filter } = options;

    const store = await this._getObjectStore(this.currentStore);

    const index = store.index(cursor.index);
    let request: IDBRequest<IDBCursorWithValue | null>;
    if (cursor.value) {
      request = index.get(cursor.value);
    } else if (cursor.bound && Array.isArray(cursor.bound)) {
      const bound = cursor.bound as [any, any, boolean, boolean];
      request = index.openCursor(IDBKeyRange.bound(...bound));
    }

    return new Promise((resolve, reject) => {
      let result: any[] = [];

      request.onsuccess = function (event) {
        const cursor = (event.target as any).result;

        if (cursor) {
          const data = cursor.value;

          if (filter && Array.isArray(filter)) {

            if (!filter.some((rule: (data: any) => boolean) => !!rule(data))) {
              cursor.continue();
              return;
            }
          }

          result.push(data);
          cursor.continue();
        } else {
          resolve(result);
        }
      };

      request.onerror = (event) => {
        reject(event);
      };
    });
  }
}
