import { openDB, type IDBPDatabase, type DBSchema } from 'idb'

interface CheckoutDB extends DBSchema {
  files: {
    key: string
    value: Blob
  }
}

export function useFileStorage() {
  const getDB = async () => {
    if (!import.meta.client) {
      throw new Error('IndexedDB can only run in browser')
    }

    const { openDB } = await import('idb')

    return openDB('checkout-files', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files')
        }
      }
    })
  }

  const saveFile = async (key: string, file: File | Blob) => {
    const db = await getDB()
    await db.put('files', file, key)
  }

  const getAllFiles = async () => {
    const db = await getDB();
    return db.getAll('files')
  }

  const getFile = async (key: string) => {
    const db = await getDB()
    return db.get('files', key)
  }

  const deleteFile = async (key: string) => {
    const db = await getDB()
    await db.delete('files', key)
  }

  return { saveFile, getFile, deleteFile, getAllFiles }
}