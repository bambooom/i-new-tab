import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

type BG = {
  id: string;
  updated: Date;
};

type BgStorage = BaseStorage<BG> & {
  update: () => void;
};

const storage = createStorage<BG>('bg-storage-key', undefined, {
  storageType: StorageType.Local,
  liveUpdate: true,
});

const bgStorage: BgStorage = {
  ...storage,
  update: () => {
    storage.set(val => {
      return { ...val, updated: new Date() };
    });
  },
};

export default bgStorage;
