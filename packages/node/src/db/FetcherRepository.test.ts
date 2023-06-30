import { expect } from 'earl'

import { FetcherRecord, FetcherRepository } from './FetcherRepository'
import { setupDatabaseTestSuite } from './test/setup'

describe(FetcherRepository.name, () => {
  const modelCreationPair = {
    chainId: 1337,
    contractCreatedAtBlock: 42069,
  }

  const modelFetcher: FetcherRecord = {
    chainId: 1337,
    lastFetchedBlock: 69420n,
  }

  const database = setupDatabaseTestSuite()
  const repository = new FetcherRepository(database, modelCreationPair)

  beforeEach(async () => {
    repository.deleteAll()
  })

  describe(FetcherRepository.prototype.addOrUpdate.name, () => {
    it('updates many fetchers', async () => {
      const modelFetcher2 = { chainId: 7331, lastFetchedBlock: 2496n }
      repository.addOrUpdate(modelFetcher)
      repository.addOrUpdate(modelFetcher2)

      expect(repository.getAll()).toEqual([modelFetcher, modelFetcher2])
    })
  })

  describe(FetcherRepository.prototype.getAll.name, () => {
    it('gets all', async () => {
      repository.addOrUpdate(modelFetcher)

      expect(repository.getAll()).toEqual([modelFetcher])
    })
  })

  describe(FetcherRepository.prototype.getByChainIdOrDefault.name, () => {
    const modelEmptyFetcher = {
      ...modelFetcher,
      lastFetchedBlock: BigInt(modelCreationPair.contractCreatedAtBlock - 1),
    }
    it('returns empty fetcher on one that was not inserted', async () => {
      expect(repository.getByChainIdOrDefault(modelFetcher.chainId)).toEqual(
        modelEmptyFetcher,
      )
    })

    it('gotten fetcher that does not exist is not inserted', async () => {
      expect(repository.getByChainIdOrDefault(modelFetcher.chainId)).toEqual(
        modelEmptyFetcher,
      )
      expect(repository.getAll()).toEqual([])
    })

    it('returns the fetcher that was previously inserted', async () => {
      repository.addOrUpdate(modelFetcher)

      expect(repository.getByChainIdOrDefault(modelFetcher.chainId)).toEqual(
        modelFetcher,
      )
    })
  })

  describe(FetcherRepository.prototype.deleteAll.name, () => {
    it('deletes all', async () => {
      repository.addOrUpdate(modelFetcher)
      repository.deleteAll()

      expect(repository.getAll()).toEqual([])
    })
  })
})
