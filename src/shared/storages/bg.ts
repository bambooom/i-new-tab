import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

type BG = {
  id: string;
  url: string;
  description: string;
  author: {
    name: string;
    id: string;
  };
  updated: number;
};

type BgStorage = BaseStorage<BG> & {
  update: () => void;
  clear: () => void;
};

const storage = createStorage<BG>('bg-storage-key', undefined, {
  storageType: StorageType.Local,
  liveUpdate: true,
});

const bgStorage: BgStorage = {
  ...storage,
  update: () => {
    storage.set(val => {
      return { ...val, updated: Date.now() };
    });
  },
  clear: () => {
    storage.set(null);
  },
};

export default bgStorage;
