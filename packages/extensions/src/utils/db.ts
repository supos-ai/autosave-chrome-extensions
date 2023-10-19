import { dbClient } from "indexdb";

import { dbConfig } from "extensions-config";

const init = () => {
  const client = dbClient(dbConfig.DB_NAME, dbConfig.DB_VERSION);
  client.onupgradeneeded((e: Event) => {
    const db = (e?.target as any).result as IDBDatabase;

    let store: IDBObjectStore;

    const isScriptsStoreExist = db.objectStoreNames.contains(
      dbConfig.SCRIPTS_STORE_NAME
    );

    if (isScriptsStoreExist) {
      store = (e?.target as any).transaction.objectStore(
        dbConfig.SCRIPTS_STORE_NAME
      );
    } else {
      store = db.createObjectStore(dbConfig.SCRIPTS_STORE_NAME, {
        keyPath: "id",
      });
    }

    [
      {
        keyPath: "widgetId",
        name: "widgetIdIndex",
      },
      {
        keyPath: "createAt",
        name: "createAtIndex",
      },
    ].forEach(({ name, keyPath }) => {
      if (!store.indexNames.contains(name)) {
        store.createIndex(name, keyPath, { unique: false });
      }
    });

    const isServiceStoreExist = db.objectStoreNames.contains(
      dbConfig.SERVICE_STORE_NAME
    );

    if (isServiceStoreExist) {
      store = (e?.target as any).transaction.objectStore(
        dbConfig.SERVICE_STORE_NAME
      );
    } else {
      store = db.createObjectStore(dbConfig.SERVICE_STORE_NAME, {
        keyPath: "id",
      });
    }

    [
      {
        keyPath: "serviceName",
        name: "serviceNameIndex",
      },
      {
        keyPath: "serviceId",
        name: "serviceIdIndex",
      },
      {
        keyPath: "createAt",
        name: "createAtIndex",
      },
    ].forEach(({ name, keyPath }) => {
      if (!store.indexNames.contains(name)) {
        store.createIndex(name, keyPath, { unique: false });
      }
    });
  });
};


export { init };
