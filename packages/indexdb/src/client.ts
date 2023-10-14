export interface DBClient {
  dbRequest: IDBOpenDBRequest;
  db: Promise<IDBDatabase>;
  name: string;
  version: number;
  onsuccess(
    handler?: ((this: IDBRequest<IDBDatabase>, ev: Event) => any) | null
  ): void;

  onupgradeneeded(
    handler?: ((this: IDBRequest<IDBDatabase>, ev: Event) => any) | null
  ): void;
  onerror(handler?: () => void): void;
  add(storeName: string, data: any): Promise<any>;
  get(storeName: string, callback: (store: IDBObjectStore) => void): any;
}

export class Client implements DBClient {
  dbRequest: IDBOpenDBRequest;
  db: Promise<IDBDatabase>;
  name: string;
  version: number;
  constructor(name: string, version: number) {
    if (!window.indexedDB) {
      throw new Error("Your browser environment does not support IndexedDB");
    }
    if (!name) {
      throw new Error("Your must pass a database name");
    }
    this.name = name;
    this.version = version;
    this.dbRequest = window.indexedDB.open(name, version);
    this.db = new Promise((resolve, reject) => {
      this.dbRequest.onsuccess = (e: Event) => {
        resolve((e?.target as any).result);
      };
      this.dbRequest.onerror = (err) => {
        reject(err);
      };
    });

    this.db.catch(console.error);
  }

  onsuccess(
    handler?: ((this: IDBRequest<IDBDatabase>, ev: Event) => any) | null
  ) {
    const _this = this;
    return new Promise((resolve) => {
      if (this.db) {
        return resolve(this.db);
      }
      this.dbRequest.onsuccess = function (e: Event) {
        _this.db = (e?.target as any).result;
        handler && handler.call(this, e);
        resolve(_this.db);
      };
    });
  }

  onerror(handler?: (e: Event) => void) {
    return new Promise((resolve, reject) => {
      if (!handler) return resolve(null);
      this.dbRequest.onerror = function (e: Event) {
        handler && handler.call(this, e);
        reject(e);
      };
    });
  }

  onupgradeneeded(
    handler?: ((this: IDBRequest<IDBDatabase>, ev: Event) => any) | null
  ) {
    return new Promise((resolve) => {
      if (!handler) return resolve(null);

      this.dbRequest.onupgradeneeded = function (e: Event) {
        handler && handler.call(this, e);
        resolve(e);
      };
    });
  }

  async add(storeName: string, data: any) {
    const db = await this.db;

    if (!db) throw new Error("db connect error");
    const request = db
      .transaction(storeName, "readwrite")
      .objectStore(storeName)
      .add(data);
    return new Promise((resolve, reject) => {
      request.onsuccess = resolve;
      request.onerror = reject;
    });
  }

  async get(storeName: string, callback: (store: IDBObjectStore) => void) {
    const db = await this.db;
    if (!db) throw new Error("db connect error");

    const store = db.transaction(storeName, "readwrite").objectStore(storeName);

    return callback(store);
  }
}

let clientInstance: Client | null;

const dbClient = (name: string, version: number = 1) => {
  if (
    clientInstance &&
    clientInstance.name === name &&
    clientInstance.version === version
  ) {
    return clientInstance;
  } else {
    return (clientInstance = new Client(name, version));
  }
};

export default dbClient;
