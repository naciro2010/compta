import { seedStore } from '../../shared/seed.js'
export function getDataset(){ return seedStore.get() }
