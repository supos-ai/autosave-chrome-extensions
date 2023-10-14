import { dbClient } from "indexdb";

import * as config from "./config";

const initDB = () => {
  const client = dbClient(config.DB_NAME, config.DB_VERSION);

  client.onupgradeneeded((e: Event) => {
    const db = (e?.target as any).result as IDBDatabase;

    let store: IDBObjectStore;

    const isScriptsStoreExist = db.objectStoreNames.contains(
      config.SCRIPTS_STORE_NAME
    );

    if (isScriptsStoreExist) {
      store = (e?.target as any).transaction.objectStore(
        config.SCRIPTS_STORE_NAME
      );
    } else {
      store = db.createObjectStore(config.SCRIPTS_STORE_NAME, {
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
      config.SERVICE_STORE_NAME
    );

    if (isServiceStoreExist) {
      store = (e?.target as any).transaction.objectStore(
        config.SERVICE_STORE_NAME
      );
    } else {
      store = db.createObjectStore(config.SERVICE_STORE_NAME, {
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

export default initDB;
