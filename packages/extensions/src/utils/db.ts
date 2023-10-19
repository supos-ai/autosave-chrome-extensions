import { Client } from "indexdb";

import { dbConfig } from "extensions-config";

// let clientInstance: Client | null;

// export const dbClient = (name: string, version: number = 1) => {
//   if (
//     clientInstance &&
//     clientInstance.name === name &&
//     clientInstance.version === version
//   ) {
//     return clientInstance;
//   } else {
//     return (clientInstance = new Client(name, version));
//   }
// };

export const init = () => {
  const updateOptions = [
    {
      storeName: dbConfig.SCRIPTS_STORE_NAME,
      option: {
        keyPath: "id",
      },
      index: [
        {
          keyPath: "widgetId",
          name: "widgetIdIndex",
          unique: false,
        },
        {
          keyPath: "createAt",
          name: "createAtIndex",
          unique: false,
        },
      ],
    },
    {
      storeName: dbConfig.SERVICE_STORE_NAME,
      option: {
        keyPath: "id",
      },
      index: [
        {
          keyPath: "serviceName",
          name: "serviceNameIndex",
          unique: false,
        },
        {
          keyPath: "serviceId",
          name: "serviceIdIndex",
          unique: false,
        },
        {
          keyPath: "createAt",
          name: "createAtIndex",
          unique: false,
        },
      ],
    },
  ];

  new Client(dbConfig.DB_NAME, dbConfig.DB_VERSION, updateOptions);
};
